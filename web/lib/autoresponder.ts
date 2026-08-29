import OpenAI from "openai";
import { ADMIN_EMAIL } from "@/lib/admin";
import { appUrl, escapeHtml, sendRawEmail } from "@/lib/email";
import { sql } from "@/lib/db";
import {
  sendSupportMessage,
  supportAddress,
  supportFrom,
  type SupportMessage,
} from "@/lib/support";

// AI triage for inbound support mail. Every inbound message is classified as
// spam (moved to the spam folder for review), answerable (auto-replied from
// the support address), or needs_info (the admin is notified by email).
// Everything the AI sends is recorded in the thread; failures leave the
// message unclassified in the inbox, so nothing is ever lost.
//
// The admin is emailed exactly once for every non-spam inbound message: the
// needs_info notification (recorded in the thread) or a plain alert (not
// recorded) for auto-replied / unclassified mail.

let client: OpenAI | null = null;

function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/** Auto-reply at most this many times per thread — breaks mail loops with
 *  other bots and hands persistent conversations to a human. */
const MAX_AUTO_REPLIES = 3;

const AUTOMATED_SENDER = /no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?@/i;

const SYSTEM_PROMPT = `You triage inbound email for support@monthlyalerts.com, the support address of MonthlyAlerts (monthlyalerts.com).

About the product, for answering questions:
- MonthlyAlerts is a multilingual construction checklist tool. A project owner sets up a punch list once; subs, inspectors, and crew all work the same list, each in their own language (English, Italian, Spanish). Content is translated automatically.
- A project has sections (construction phases) containing items with status (open / in progress / done), assignee, due date, photo attachments, and comments. Sections can carry budget vs. actual amounts.
- Roles per project: owner (everything, manages members and settings), editor (add/edit items, change status, upload photos), commenter (view and comment). Members are invited by email.
- Every member receives a monthly status email in their language summarizing progress, with an unsubscribe link.
- Sign-in is at monthlyalerts.com/login (email + password, with email confirmation and password reset).
- Projects are currently free to create. Project data is stored for 2 years from creation; owners get an email warning 30 days before expiry.
- Legal pages: monthlyalerts.com/terms and monthlyalerts.com/privacy.

Classify the email and respond as JSON: {"verdict": "spam" | "reply" | "needs_info", "reply": string | null, "reason": string}

- "spam": unsolicited marketing, SEO/link/lead-generation offers, phishing, scams, adult or crypto promotions, or bulk mail clearly unrelated to the product. When in doubt between spam and a real (if oddly written) customer message, do NOT choose spam.
- "reply": a genuine question you can fully and confidently answer from the product facts above. Put the complete reply in "reply": plain text, no markdown, in the sender's language, friendly and concise, starting with an appropriate greeting and ending exactly with:\n\nMonthlyAlerts Support\nInvite them to reply if they need anything else.
- "needs_info": everything else — account-specific requests (deletions, data/privacy requests, billing, refunds), bug reports, anything needing human action or information not listed above, legal or sensitive matters, or any case where you are not fully confident. Set "reply" to null.

"reason" is one short sentence explaining the verdict, for the site operator.`;

type Verdict = {
  verdict: "spam" | "reply" | "needs_info";
  reply: string | null;
  reason: string;
};

/**
 * Classifies and acts on one freshly stored inbound message. Never throws:
 * on any failure the message simply stays unclassified in the inbox.
 */
export async function runAutoresponder(
  message: SupportMessage,
  opts: { autoSubmitted?: boolean } = {}
): Promise<void> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      await record(message.id, "skipped", "OPENAI_API_KEY not configured");
      await alertAdmin(message, "Stored unclassified (AI not configured)");
      return;
    }
    // Never auto-reply to machines — that's how mail loops start.
    if (opts.autoSubmitted || AUTOMATED_SENDER.test(message.from_email)) {
      await record(message.id, "skipped", "Automated sender — not auto-replied");
      await alertAdmin(message, "Automated sender — stored without a reply");
      return;
    }

    const verdict = await classify(message);

    if (verdict.verdict === "spam") {
      // Quarantine, don't destroy: the whole thread moves to the spam folder
      // for review. Threads a human has already replied in are never
      // auto-spammed — those go to the admin instead.
      const replied = (await sql()`
        SELECT count(*)::int AS n FROM support_messages
        WHERE thread_key = ${message.thread_key} AND direction = 'outbound' AND NOT auto
      `) as { n: number }[];
      if ((replied[0]?.n ?? 0) === 0) {
        await sql()`
          UPDATE support_messages SET folder = 'spam' WHERE thread_key = ${message.thread_key}
        `;
        await record(message.id, "spam", verdict.reason);
        return;
      }
      await notifyAdmin(message, `Flagged as spam mid-conversation: ${verdict.reason}`);
      await record(message.id, "needs_info", `Spam verdict in an active thread: ${verdict.reason}`);
      return;
    }

    if (verdict.verdict === "reply" && verdict.reply) {
      const autoCount = (await sql()`
        SELECT count(*)::int AS n FROM support_messages
        WHERE thread_key = ${message.thread_key} AND auto AND to_email = ${message.counterparty_email}
      `) as { n: number }[];
      if ((autoCount[0]?.n ?? 0) >= MAX_AUTO_REPLIES) {
        await notifyAdmin(message, "Auto-reply limit reached for this thread — human follow-up needed");
        await record(message.id, "needs_info", "Auto-reply limit reached");
        return;
      }
      const subject = message.subject ?? "Your message to MonthlyAlerts";
      await sendSupportMessage({
        to: message.counterparty_email,
        subject: /^re\s*:/i.test(subject) ? subject : `Re: ${subject}`,
        body: verdict.reply,
        threadKey: message.thread_key,
        auto: true,
      });
      await record(message.id, "responded", verdict.reason);
      await alertAdmin(message, "Auto-replied", verdict.reply);
      return;
    }

    await notifyAdmin(message, verdict.reason);
    await record(message.id, "needs_info", verdict.reason);
  } catch (err) {
    console.error("autoresponder failed; message left unclassified:", err);
    await alertAdmin(message, "Stored unclassified (AI triage failed)").catch(() => {});
  }
}

/**
 * Plain new-mail alert to the site admin, with the inbound text (and the
 * auto-reply, when one was sent). Deliberately NOT recorded in the inbox —
 * unlike notifyAdmin, this is a heads-up, not part of the correspondence.
 */
async function alertAdmin(
  message: SupportMessage,
  action: string,
  autoReply?: string
): Promise<void> {
  const link = `${appUrl()}/admin/inbox/${encodeURIComponent(message.thread_key)}`;
  const body = `New support email — ${action}.

From: ${message.from_name ?? ""} <${message.from_email}>
Subject: ${message.subject ?? "(no subject)"}

--- Message ---
${(message.text_body ?? "(no text body)").slice(0, 4000)}
${autoReply ? `\n--- Auto-reply sent ---\n${autoReply}\n` : ""}
View the thread: ${link}`;

  await sendRawEmail({
    from: supportFrom(),
    to: ADMIN_EMAIL,
    subject: `[Support] New email: ${message.subject ?? "(no subject)"}`,
    text: body,
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escapeHtml(body)}</div>`,
  });
}

async function classify(message: SupportMessage): Promise<Verdict> {
  const response = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          from: `${message.from_name ?? ""} <${message.from_email}>`.trim(),
          subject: message.subject ?? "",
          body: (message.text_body ?? message.html_body ?? "").slice(0, 8000),
        }),
      },
    ],
  });
  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  if (!["spam", "reply", "needs_info"].includes(parsed.verdict)) {
    throw new Error(`classifier returned invalid verdict: ${parsed.verdict}`);
  }
  return {
    verdict: parsed.verdict,
    reply: typeof parsed.reply === "string" && parsed.reply.trim() !== "" ? parsed.reply : null,
    reason: typeof parsed.reason === "string" ? parsed.reason : "",
  };
}

async function record(id: string, verdict: string, note: string): Promise<void> {
  await sql()`
    UPDATE support_messages SET ai_verdict = ${verdict}, ai_note = ${note} WHERE id = ${id}
  `;
}

/**
 * Emails the site admin that a message needs a human, and records the
 * notification in the thread so the full correspondence trail is visible.
 */
async function notifyAdmin(message: SupportMessage, reason: string): Promise<void> {
  const link = `${appUrl()}/admin/inbox/${encodeURIComponent(message.thread_key)}`;
  const subject = `[Support] Needs attention: ${message.subject ?? "(no subject)"}`;
  const body = `A support email needs your attention.

From: ${message.from_name ?? ""} <${message.from_email}>
Subject: ${message.subject ?? "(no subject)"}
Reason: ${reason}

--- Message ---
${(message.text_body ?? "(no text body)").slice(0, 2000)}

Reply from the admin inbox: ${link}`;

  await sendRawEmail({
    from: supportFrom(),
    to: ADMIN_EMAIL,
    subject,
    text: body,
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escapeHtml(body)}</div>`,
  });

  // Recorded in the customer's thread (counterparty unchanged) so the trail
  // shows the hand-off; auto marks it as machine-sent.
  await sql()`
    INSERT INTO support_messages
      (direction, thread_key, counterparty_email, from_email, from_name,
       to_email, subject, text_body, auto)
    VALUES
      ('outbound', ${message.thread_key}, ${message.counterparty_email},
       ${supportAddress()}, 'MonthlyAlerts', ${ADMIN_EMAIL}, ${subject},
       ${body}, true)
  `;
}
