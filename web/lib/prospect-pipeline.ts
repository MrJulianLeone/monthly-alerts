import { resolveMx } from "node:dns/promises";
import OpenAI from "openai";
import { ADMIN_EMAIL } from "@/lib/admin";
import { sql } from "@/lib/db";
import { appUrl, escapeHtml, sendRawEmail } from "@/lib/email";
import {
  HARD_DAILY_MAX,
  inSendWindow,
  outreachAddress,
  outreachConfigured,
  outreachFromName,
  outreachSend,
} from "@/lib/outreach";
import {
  bounceRateExceeded,
  effectiveDailyCap,
  getSettings,
  isSuppressed,
  sendsSince,
  setStatus,
  suppress,
  type Prospect,
  type ProspectingSettings,
} from "@/lib/prospecting";
import type { SupportMessage } from "@/lib/support";

// The daily prospecting pipeline. Each run advances small batches through
// every stage; every step is idempotent, so a failed or interrupted run
// simply resumes on the next one. Called by /api/cron/prospecting and the
// admin "Run now" button. No stage throws past runPipeline: a stage failure
// is recorded in the summary and the rest still run.

let client: OpenAI | null = null;
function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const FROM_NAME = () => outreachFromName();

const PRODUCT_CONTEXT = `MonthlyAlerts (monthlyalerts.com) is a multilingual construction punch-list tool.
A project owner sets up a checklist once; subs, inspectors, and crew all work the same list, each in their
own language (English, Italian, Spanish) — content is translated automatically. Items carry status,
assignee, due dates, photos, and comments; sections track budget vs. actual. Every project member gets a
monthly status email in their language. Pricing: $100 one time per project, not a subscription, and
everyone invited joins free. THE OFFER for outreach: "try your next project on us" — the first project is
free (the link in the email grants the credit automatically when they sign up). Never say "buy our
software"; the ask is to run one real project on it. The pitch to contractors: fewer walkthrough disputes,
one shared list instead of texts and paper, Spanish-speaking crews read the same list in Spanish, clients
see progress monthly without the contractor writing reports.`;

export type StageResult = { [key: string]: number | string };
export type PipelineSummary = Record<string, StageResult>;

export async function runPipeline(): Promise<PipelineSummary> {
  const summary: PipelineSummary = {};
  const stage = async (name: string, fn: () => Promise<StageResult>) => {
    try {
      summary[name] = await fn();
    } catch (err) {
      console.error(`prospecting: stage ${name} failed:`, err);
      summary[name] = { error: err instanceof Error ? err.message : String(err) };
    }
  };

  await stage("poll_inbox", pollInbox);
  await stage("conversions", markConversions);
  await stage("revive_snoozed", reviveSnoozed);
  await stage("enrich", () => enrichBatch(8));
  await stage("score", () => scoreBatch(10));
  await stage("draft", () => draftBatch(6));
  await stage("send", sendBatch);
  return summary;
}

// ---------------------------------------------------------------------------
// Inbound: replies, bounces, complaints
//
// Outreach goes out from an address on our own domain, so replies land in
// the same Resend inbound webhook as support mail (support_messages). The
// webhook hands each inbound message to handleOutreachInbound first; if it
// belongs to a prospect it is processed here and never reaches the support
// autoresponder. pollInbox is the daily catch-up sweep over the same table
// (idempotent), plus DSN-style bounces that arrive as mail. Real bounces and
// spam complaints arrive as Resend webhook events (email.bounced /
// email.complained) and are handled by handleBounceEvent / handleComplaint.
// ---------------------------------------------------------------------------

type InboundMail = {
  /** Unique id for dedupe (support_messages.id, prefixed). */
  id: string;
  fromEmail: string;
  fromRaw: string;
  subject: string | null;
  text: string;
  messageId: string | null;
  inReplyTo: string | null;
};

function fromSupport(m: SupportMessage): InboundMail {
  const text = m.text_body ?? (m.html_body ? stripHtml(m.html_body) : "");
  return {
    id: `support:${m.id}`,
    fromEmail: m.from_email.toLowerCase(),
    fromRaw: m.from_name ? `${m.from_name} <${m.from_email}>` : m.from_email,
    subject: m.subject,
    text,
    messageId: m.message_id,
    inReplyTo: m.in_reply_to,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/** Finds the prospect an inbound message belongs to, by thread first. */
async function prospectForInbound(mail: InboundMail): Promise<Prospect | null> {
  const rows = (await sql()`
    SELECT p.* FROM prospects p
    LEFT JOIN prospect_emails e
      ON e.prospect_id = p.id AND e.direction = 'outbound'
     AND ${mail.inReplyTo}::text IS NOT NULL AND e.message_id_header = ${mail.inReplyTo}
    WHERE e.id IS NOT NULL
       OR (p.email IS NOT NULL AND p.email = ${mail.fromEmail} AND p.sent_at IS NOT NULL)
    ORDER BY (e.id IS NOT NULL) DESC, p.sent_at DESC NULLS LAST
    LIMIT 1
  `) as Prospect[];
  return rows[0] ?? null;
}

/**
 * Called by the inbound webhook for every message on our domain. Returns
 * true when the message was an outreach reply/bounce and has been handled
 * (so the support autoresponder must not touch it).
 */
export async function handleOutreachInbound(message: SupportMessage): Promise<boolean> {
  const mail = fromSupport(message);
  const seen = (await sql()`
    SELECT 1 FROM prospect_emails WHERE gmail_message_id = ${mail.id}
  `) as unknown[];
  if (seen.length > 0) return true;

  const isDsn = /mailer-daemon|postmaster|mail delivery/i.test(mail.fromRaw);
  if (isDsn) return handleDsn(mail);
  return handleReply(mail);
}

async function pollInbox(): Promise<StageResult> {
  const settings = await getSettings();
  const after = settings.last_poll_at
    ? new Date(new Date(settings.last_poll_at).getTime() - 60 * 60 * 1000) // 1h overlap
    : new Date(Date.now() - 7 * 86_400_000);
  const pollStarted = new Date();

  const messages = (await sql()`
    SELECT * FROM support_messages
    WHERE direction = 'inbound' AND created_at >= ${after.toISOString()}
    ORDER BY created_at
    LIMIT 200
  `) as SupportMessage[];

  let handled = 0;
  for (const m of messages) {
    const seen = (await sql()`
      SELECT 1 FROM prospect_emails WHERE gmail_message_id = ${"support:" + m.id}
    `) as unknown[];
    if (seen.length > 0) continue;
    if (await handleOutreachInbound(m)) handled++;
  }

  await sql()`
    UPDATE prospecting_settings SET last_poll_at = ${pollStarted.toISOString()} WHERE id
  `;
  return { scanned: messages.length, handled };
}

/** A delivery-status notification that arrived as ordinary mail. */
async function handleDsn(mail: InboundMail): Promise<boolean> {
  const bounced = mail.text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi)
    ?.map((e) => e.toLowerCase())
    .find((e) => !e.endsWith("@" + outreachAddress().split("@")[1]));
  if (!bounced) return false;
  const rows = (await sql()`SELECT * FROM prospects WHERE email = ${bounced} LIMIT 1`) as Prospect[];
  const prospect = rows[0];
  if (!prospect) return false;
  await recordBounce(prospect, mail.id, mail.subject, mail.text, "Delivery failed (DSN received)");
  return true;
}

async function recordBounce(
  prospect: Prospect,
  dedupeId: string,
  subject: string | null,
  body: string,
  note: string
): Promise<void> {
  await sql()`
    INSERT INTO prospect_emails (prospect_id, direction, kind, subject, body_text,
                                 gmail_message_id, gmail_thread_id)
    VALUES (${prospect.id}, 'inbound', 'bounce', ${subject}, ${body.slice(0, 4000)},
            ${dedupeId}, ${prospect.gmail_thread_id})
    ON CONFLICT (gmail_message_id) DO NOTHING
  `;
  if (prospect.email) await suppress(prospect.email, "bounced");
  await setStatus(prospect.id, "bounced", note);

  if (await bounceRateExceeded()) {
    await sql()`UPDATE prospecting_settings SET paused = true WHERE id AND NOT paused`;
    await alertAdmin(
      "Prospecting paused: bounce rate too high",
      "The 7-day bounce rate crossed 5%, so outbound sends are paused to protect the domain's deliverability.\n" +
        "Review recent bounces at " + appUrl() + "/admin/prospects, fix the email-finding quality, " +
        "then unpause in settings."
    );
  }
}

/** Resend `email.bounced` for one of our outreach sends. */
export async function handleBounceEvent(
  providerId: string,
  detail: string
): Promise<boolean> {
  const rows = (await sql()`
    SELECT p.* FROM prospect_emails e JOIN prospects p ON p.id = e.prospect_id
    WHERE e.gmail_message_id = ${providerId} AND e.direction = 'outbound'
    LIMIT 1
  `) as Prospect[];
  const prospect = rows[0];
  if (!prospect) return false;
  await recordBounce(prospect, `bounce:${providerId}`, "Bounce", detail, "Bounced (Resend)");
  return true;
}

/**
 * Resend `email.complained`: the recipient marked us as spam. On a shared
 * domain one complaint is already too many — suppress, pause everything,
 * and tell the admin.
 */
export async function handleComplaint(providerId: string, recipient: string | null): Promise<boolean> {
  const rows = (await sql()`
    SELECT p.* FROM prospect_emails e JOIN prospects p ON p.id = e.prospect_id
    WHERE e.gmail_message_id = ${providerId} AND e.direction = 'outbound'
    LIMIT 1
  `) as Prospect[];
  const prospect = rows[0];
  const email = prospect?.email ?? recipient?.toLowerCase() ?? null;
  if (email) await suppress(email, "complaint");
  if (prospect) {
    await sql()`
      INSERT INTO prospect_emails (prospect_id, direction, kind, subject, body_text, gmail_message_id)
      VALUES (${prospect.id}, 'inbound', 'bounce', 'Spam complaint', 'Recipient reported the email as spam', ${"complaint:" + providerId})
      ON CONFLICT (gmail_message_id) DO NOTHING
    `;
    await setStatus(prospect.id, "suppressed", "Spam complaint — suppressed");
  }
  await sql()`UPDATE prospecting_settings SET paused = true WHERE id AND NOT paused`;
  await alertAdmin(
    "Prospecting paused: spam complaint",
    `${email ?? "A recipient"} reported an outreach email as spam. Sending is paused to protect ` +
      "monthlyalerts.com deliverability (invites, password resets, monthly reports all send from this domain).\n\n" +
      "Before unpausing: check the last week's sends for anything that isn't personal, short, and relevant; " +
      "tighten the score threshold or target notes; and keep the daily cap low.\n" +
      appUrl() + "/admin/prospects"
  );
  return !!prospect;
}

const REPLY_PROMPT = `You classify replies to a cold outreach email about MonthlyAlerts, a construction
punch-list tool. Respond as JSON: {"class": "interested" | "not_now" | "no" | "unsubscribe" | "ooo" | "other", "note": string}

- "interested": wants to learn more, asks a question, agrees to try it or talk.
- "not_now": polite deferral — busy season, maybe later, check back some time.
- "no": a clear decline without asking to never be contacted.
- "unsubscribe": asks to stop emailing, remove from list, or is angry about being contacted.
- "ooo": an automatic out-of-office or vacation reply.
- "other": anything else (forwarded to a colleague, wrong person, unclear).

"note" is one short sentence for the site operator summarizing the reply.`;

async function handleReply(mail: InboundMail): Promise<boolean> {
  const prospect = await prospectForInbound(mail);
  if (!prospect) return false; // Unrelated mail — leave it to the support inbox.

  const body = mail.text.slice(0, 8000);
  let verdict: { class: string; note: string } = { class: "other", note: "AI unavailable" };
  try {
    const res = await openai().chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: REPLY_PROMPT },
        { role: "user", content: JSON.stringify({ from: mail.fromRaw, subject: mail.subject, body }) },
      ],
    });
    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    if (["interested", "not_now", "no", "unsubscribe", "ooo", "other"].includes(parsed.class)) {
      verdict = { class: parsed.class, note: String(parsed.note ?? "") };
    }
  } catch (err) {
    console.error("prospecting: reply classification failed:", err);
  }

  await sql()`
    INSERT INTO prospect_emails (prospect_id, direction, kind, subject, body_text,
                                 gmail_message_id, gmail_thread_id, message_id_header,
                                 ai_class, ai_note)
    VALUES (${prospect.id}, 'inbound', 'reply', ${mail.subject}, ${body},
            ${mail.id}, ${prospect.gmail_thread_id}, ${mail.messageId},
            ${verdict.class}, ${verdict.note})
    ON CONFLICT (gmail_message_id) DO NOTHING
  `;

  if (verdict.class === "ooo") {
    // Push the follow-up out a week; the sequence continues.
    await sql()`
      UPDATE prospects SET resume_at = now() + interval '7 days', updated_at = now()
      WHERE id = ${prospect.id}
    `;
    return true;
  }

  await sql()`
    UPDATE prospects
    SET replied_at = COALESCE(replied_at, now()), reply_class = ${verdict.class},
        updated_at = now()
    WHERE id = ${prospect.id}
  `;

  const settings = await getSettings();
  if (verdict.class === "unsubscribe") {
    if (prospect.email) await suppress(prospect.email, "unsubscribe");
    await setStatus(prospect.id, "suppressed", "Asked to stop — suppressed");
  } else if (verdict.class === "no") {
    if (prospect.email) await suppress(prospect.email, "declined");
    await setStatus(prospect.id, "suppressed", "Declined — suppressed");
  } else if (verdict.class === "not_now") {
    await sql()`
      UPDATE prospects
      SET status = 'snoozed', status_note = ${verdict.note},
          resume_at = now() + make_interval(months => ${settings.snooze_months}),
          updated_at = now()
      WHERE id = ${prospect.id}
    `;
  } else {
    await setStatus(prospect.id, "replied", verdict.note);
  }

  if (verdict.class === "interested" || verdict.class === "other") {
    await alertAdmin(
      `[Prospecting] ${verdict.class === "interested" ? "Interested reply" : "Reply"} from ${prospect.company}`,
      `${prospect.company} (${prospect.email ?? "unknown email"}) replied — classified "${verdict.class}".

${verdict.note}

--- Reply ---
${body.slice(0, 3000)}

Answer from the admin inbox (it replies from ${outreachAddress()} in the same thread):
${appUrl()}/admin/inbox

Prospect record: ${appUrl()}/admin/prospects/${prospect.id}`
    );
  }
  return true;
}

// ---------------------------------------------------------------------------
// Conversions and snooze revival
// ---------------------------------------------------------------------------

const FREEMAIL = /@(gmail|yahoo|hotmail|outlook|aol|icloud|live|msn|proton|pm)\./i;

async function markConversions(): Promise<StageResult> {
  const rows = (await sql()`
    SELECT p.id, p.email FROM prospects p
    WHERE p.converted_at IS NULL AND p.email IS NOT NULL AND p.sent_at IS NOT NULL
  `) as { id: string; email: string }[];
  let converted = 0;
  for (const p of rows) {
    const domain = p.email.split("@")[1] ?? "";
    const freemail = FREEMAIL.test(p.email);
    const match = (await sql()`
      SELECT 1 FROM users u
      WHERE u.deleted_at IS NULL
        AND (lower(u.email) = ${p.email}
             OR (NOT ${freemail} AND lower(u.email) LIKE ${"%@" + domain}))
      LIMIT 1
    `) as unknown[];
    if (match.length > 0) {
      await sql()`
        UPDATE prospects
        SET converted_at = now(), status = 'converted', updated_at = now()
        WHERE id = ${p.id}
      `;
      converted++;
    }
  }
  return { converted };
}

async function reviveSnoozed(): Promise<StageResult> {
  const rows = (await sql()`
    UPDATE prospects
    SET status = 'scored', status_note = 'Revived after snooze — needs fresh drafts',
        draft_subject = NULL, draft_body = NULL, followup_subject = NULL, followup_body = NULL,
        resume_at = NULL, updated_at = now()
    WHERE status = 'snoozed' AND resume_at IS NOT NULL AND resume_at < now()
    RETURNING id
  `) as unknown[];
  return { revived: rows.length };
}

// ---------------------------------------------------------------------------
// Enrichment: website -> pages -> email -> MX
// ---------------------------------------------------------------------------

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MonthlyAlertsBot/1.0)" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("text")) return null;
    return (await res.text()).slice(0, 400_000);
  } catch {
    return null;
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const JUNK_EMAIL =
  /\.(png|jpe?g|gif|webp|svg|css|js)$|example\.|sentry|wixpress|godaddy|@[0-9]+x\./i;

function extractEmails(html: string): string[] {
  const found = new Set<string>();
  for (const m of html.matchAll(EMAIL_RE)) {
    const e = m[0].toLowerCase().replace(/^mailto:/, "");
    if (!JUNK_EMAIL.test(e)) found.add(e);
  }
  return [...found].slice(0, 10);
}

async function hasMx(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const mx = await resolveMx(domain);
    return mx.length > 0;
  } catch {
    return false;
  }
}

function normalizeUrl(u: string): string {
  const trimmed = u.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Loose JSON extraction for LLM output that may be fenced or prefixed. */
function looseJson(text: string): Record<string, unknown> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Finds a company website via the OpenAI web-search tool. Null on failure. */
async function findWebsite(p: Prospect): Promise<string | null> {
  const where = [p.city, p.region].filter(Boolean).join(", ");
  const prompt = `Find the official website of the construction company "${p.company}"${
    where ? ` located in ${where}` : ""
  }${p.phone ? ` (phone ${p.phone})` : ""}${
    p.license_no ? ` (contractor license ${p.license_no})` : ""
  }. Respond ONLY as JSON: {"url": "https://..."} or {"url": null} if you cannot find its own site.
Directories (Yelp, Houzz, BBB, Facebook) do not count as the company's own website.`;
  for (const tool of ["web_search", "web_search_preview"]) {
    try {
      const res = await openai().responses.create({
        model: "gpt-4o",
        tools: [{ type: tool as "web_search" }],
        input: prompt,
      });
      const parsed = looseJson(res.output_text ?? "");
      const url = typeof parsed?.url === "string" ? parsed.url : null;
      return url ? normalizeUrl(url) : null;
    } catch (err) {
      console.error(`prospecting: web search (${tool}) failed:`, err);
    }
  }
  return null;
}

const RESEARCH_PROMPT = `You verify and research a small construction company's website for B2B outreach.
Given the company record and text scraped from a website, respond as JSON:
{"is_match": boolean, "summary": string, "contact_name": string | null, "best_email": string | null}

- "is_match": does this site plausibly belong to THIS company (name/city/phone line up)? When clearly a
  different business, false.
- "summary": 4-8 sentences for a salesperson: what they build, service area, team size hints, notable
  projects, tone — concrete details useful for personalizing an email. Empty string if not a match.
- "contact_name": the owner's or main contact's first+last name if the site shows one, else null.
- "best_email": pick the best outreach address from candidate_emails (prefer a person or office@ over
  info@/noreply; must be from the list, or null if the list is empty or all unusable).`;

async function enrichBatch(limit: number): Promise<StageResult> {
  const rows = (await sql()`
    SELECT * FROM prospects WHERE status = 'new' ORDER BY created_at LIMIT ${limit}
  `) as Prospect[];
  let researched = 0;
  let parked = 0;

  for (const p of rows) {
    try {
      let website = p.website ? normalizeUrl(p.website) : null;
      if (!website) website = await findWebsite(p);
      if (!website) {
        await setStatus(p.id, "no_website", "No website found (search + roster)");
        parked++;
        continue;
      }

      const home = await fetchPage(website);
      if (!home) {
        await setStatus(p.id, "no_website", `Website unreachable: ${website}`);
        parked++;
        continue;
      }

      // Contact-ish pages on the same host, up to 3.
      const emails = new Set(extractEmails(home));
      let text = htmlToText(home).slice(0, 6000);
      const host = new URL(website).host;
      const links = [...home.matchAll(/href=["']([^"'#]+)["']/gi)]
        .map((m) => m[1])
        .filter((h) => /contact|about|team|kontakt|chi-siamo|contatti/i.test(h))
        .slice(0, 6);
      let fetched = 0;
      for (const link of links) {
        if (fetched >= 3) break;
        let abs: URL;
        try {
          abs = new URL(link, website);
        } catch {
          continue;
        }
        if (abs.host !== host) continue;
        const page = await fetchPage(abs.toString());
        if (!page) continue;
        fetched++;
        extractEmails(page).forEach((e) => emails.add(e));
        text += "\n\n--- " + abs.pathname + " ---\n" + htmlToText(page).slice(0, 3000);
      }

      const res = await openai().chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: RESEARCH_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              company: p.company,
              city: p.city,
              region: p.region,
              phone: p.phone,
              classification: p.classification,
              website,
              candidate_emails: [...emails],
              site_text: text.slice(0, 12_000),
            }),
          },
        ],
      });
      const verdict = JSON.parse(res.choices[0].message.content ?? "{}") as {
        is_match?: boolean;
        summary?: string;
        contact_name?: string | null;
        best_email?: string | null;
      };

      if (!verdict.is_match) {
        await setStatus(p.id, "no_website", `Found site did not match: ${website}`);
        parked++;
        continue;
      }

      const email =
        typeof verdict.best_email === "string" && emails.has(verdict.best_email.toLowerCase())
          ? verdict.best_email.toLowerCase()
          : [...emails][0] ?? null;

      if (!email) {
        await sql()`
          UPDATE prospects
          SET website = ${website}, research = ${verdict.summary ?? null},
              contact_name = COALESCE(contact_name, ${verdict.contact_name ?? null}),
              status = 'no_email', status_note = 'No email found on the site',
              updated_at = now()
          WHERE id = ${p.id}
        `;
        parked++;
        continue;
      }
      if (await isSuppressed(email)) {
        await setStatus(p.id, "suppressed", `Found email is suppressed: ${email}`);
        parked++;
        continue;
      }
      if (!(await hasMx(email))) {
        await sql()`
          UPDATE prospects
          SET website = ${website}, research = ${verdict.summary ?? null},
              status = 'no_email', status_note = ${"Email domain has no MX: " + email},
              updated_at = now()
          WHERE id = ${p.id}
        `;
        parked++;
        continue;
      }

      await sql()`
        UPDATE prospects
        SET website = ${website}, email = ${email}, research = ${verdict.summary ?? null},
            contact_name = COALESCE(contact_name, ${verdict.contact_name ?? null}),
            status = 'researched', status_note = NULL, updated_at = now()
        WHERE id = ${p.id}
      `;
      researched++;
    } catch (err) {
      console.error(`prospecting: enrich failed for ${p.id}:`, err);
    }
  }
  return { researched, parked };
}

// ---------------------------------------------------------------------------
// Scoring and drafting
// ---------------------------------------------------------------------------

const SCORE_PROMPT = `You score how good a fit a construction company is as a prospect for MonthlyAlerts.

${PRODUCT_CONTEXT}

Ideal prospects: residential remodelers and general contractors who run multiple client projects with
subs and inspectors, especially where owner and crew speak different languages, or clients are remote.
Poor fits: single-trade operators with no client coordination (e.g. a solo roofer), commercial-only
mega-firms with enterprise PM software, and companies that look inactive.

Respond as JSON: {"score": 0-10, "reason": string} — reason is 1-3 sentences for the site operator.`;

async function scoreBatch(limit: number): Promise<StageResult> {
  const settings = await getSettings();
  const rows = (await sql()`
    SELECT * FROM prospects WHERE status = 'researched' ORDER BY created_at LIMIT ${limit}
  `) as Prospect[];
  let scored = 0;
  let rejected = 0;

  for (const p of rows) {
    try {
      const res = await openai().chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SCORE_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              company: p.company,
              city: p.city,
              region: p.region,
              classification: p.classification,
              license_issued: p.license_issued,
              research: p.research,
              operator_targeting_notes: settings.target_notes,
            }),
          },
        ],
      });
      const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
      const score = Math.max(0, Math.min(10, Math.round(Number(parsed.score) || 0)));
      const reason = typeof parsed.reason === "string" ? parsed.reason : "";
      const below = score < settings.score_threshold;
      await sql()`
        UPDATE prospects
        SET score = ${score}, score_reason = ${reason},
            status = ${below ? "rejected_fit" : "scored"},
            status_note = ${below ? `Score ${score} below threshold ${settings.score_threshold}` : null},
            updated_at = now()
        WHERE id = ${p.id}
      `;
      below ? rejected++ : scored++;
    } catch (err) {
      console.error(`prospecting: score failed for ${p.id}:`, err);
    }
  }
  return { scored, rejected };
}

const DRAFT_PROMPT = `You write cold outreach emails for MonthlyAlerts, sent personally by its founder.

${PRODUCT_CONTEXT}

Write the INITIAL email and a FOLLOW-UP (sent ~4-5 days later if there is no reply) for the given
prospect. Respond as JSON:
{"initial_subject": string, "initial_body": string, "followup_subject": string, "followup_body": string}

Rules:
- Plain text only. No markdown, no HTML, no bullet lists, no placeholders like [Name] — write the final text.
- Short: initial under 120 words, follow-up under 60. Sound like a busy founder, not a marketer.
- Personalize from the research: reference something concrete about THEIR business in the first sentence.
- The ask is the offer: run their next project on MonthlyAlerts free (the link grants it). Not a demo, not a purchase.
- Address the contact by first name if known, otherwise open naturally without a name.
- Include the literal token {{link}} exactly once in the initial body where the site link belongs
  (e.g. "you can see how it works here: {{link}}"). The follow-up must NOT contain {{link}}.
- Follow-up: reply-style nudge in the same thread — brief, adds one new angle, no guilt-tripping.
- Sign off with the sender's first name only. No unsubscribe text (added automatically).
- The email must be honest: no fake "we met", no false urgency, no claims beyond the product facts.`;

async function draftBatch(limit: number): Promise<StageResult> {
  const settings = await getSettings();
  const rows = (await sql()`
    SELECT * FROM prospects WHERE status = 'scored' ORDER BY score DESC, created_at LIMIT ${limit}
  `) as Prospect[];
  let drafted = 0;

  for (const p of rows) {
    try {
      const res = await openai().chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: DRAFT_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              sender_first_name: FROM_NAME(),
              company: p.company,
              contact_name: p.contact_name,
              city: p.city,
              region: p.region,
              research: p.research,
              score_reason: p.score_reason,
              operator_targeting_notes: settings.target_notes,
              previously_contacted: p.sent_at ? "yes — this is a revived snoozed prospect" : "no",
            }),
          },
        ],
      });
      const d = JSON.parse(res.choices[0].message.content ?? "{}");
      const ok =
        typeof d.initial_subject === "string" &&
        typeof d.initial_body === "string" &&
        d.initial_body.includes("{{link}}") &&
        typeof d.followup_subject === "string" &&
        typeof d.followup_body === "string";
      if (!ok) throw new Error("draft response missing fields or {{link}}");
      await sql()`
        UPDATE prospects
        SET draft_subject = ${d.initial_subject}, draft_body = ${d.initial_body},
            followup_subject = ${d.followup_subject}, followup_body = ${d.followup_body},
            status = 'pending_approval', status_note = NULL, updated_at = now()
        WHERE id = ${p.id}
      `;
      drafted++;
    } catch (err) {
      console.error(`prospecting: draft failed for ${p.id}:`, err);
    }
  }
  return { drafted };
}

// ---------------------------------------------------------------------------
// Sending: approved initials + due follow-ups, under the daily cap
// ---------------------------------------------------------------------------

function renderBody(p: Prospect, body: string): string {
  const link = `${appUrl()}/w/${p.visit_token}`;
  const rendered = body.includes("{{link}}")
    ? body.replaceAll("{{link}}", link)
    : `${body}\n\nP.S. You can see how it works here: ${link}`;
  const unsub = `${appUrl()}/w/${p.visit_token}/u`;
  return `${rendered}\n\n--\n${FROM_NAME()}, MonthlyAlerts · ${outreachAddress()}\nIf you'd rather not hear from me again, one click stops it: ${unsub}`;
}

async function sendBatch(): Promise<StageResult> {
  if (!outreachConfigured()) return { skipped: "outreach not enabled (OUTREACH_ENABLED)" };
  if (!inSendWindow()) return { skipped: "weekend — no sends" };
  const settings = await getSettings();
  if (settings.paused) return { skipped: "paused" };
  if (await bounceRateExceeded()) {
    await sql()`UPDATE prospecting_settings SET paused = true WHERE id AND NOT paused`;
    return { skipped: "bounce rate exceeded — paused" };
  }

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  // Hard ceiling regardless of settings: this is the product's own domain.
  const cap = Math.min(effectiveDailyCap(settings), HARD_DAILY_MAX);
  let budget = cap - (await sendsSince(startOfDay));
  if (budget <= 0) return { skipped: "daily cap reached", cap };

  let followups = 0;
  let initials = 0;

  // Follow-ups first (time-sensitive). Only when: initial sent N+ days ago,
  // nothing inbound on the prospect, and any OOO hold (resume_at) has passed.
  const dueFollowups = (await sql()`
    SELECT * FROM prospects
    WHERE status = 'sent' AND followup_sent_at IS NULL
      AND followup_body IS NOT NULL
      AND sent_at < now() - make_interval(days => ${settings.followup_days})
      AND (resume_at IS NULL OR resume_at < now())
      AND NOT EXISTS (
        SELECT 1 FROM prospect_emails e
        WHERE e.prospect_id = prospects.id AND e.direction = 'inbound'
      )
    ORDER BY sent_at LIMIT ${Math.max(budget, 0)}
  `) as Prospect[];

  for (const p of dueFollowups) {
    if (budget <= 0) break;
    if (!p.email || (await isSuppressed(p.email))) {
      await setStatus(p.id, "suppressed", "Suppressed before follow-up");
      continue;
    }
    try {
      const initial = (await sql()`
        SELECT message_id_header FROM prospect_emails
        WHERE prospect_id = ${p.id} AND kind = 'initial' ORDER BY created_at DESC LIMIT 1
      `) as { message_id_header: string | null }[];
      const sent = await outreachSend({
        to: p.email,
        subject: p.followup_subject ?? `Re: ${p.draft_subject ?? "MonthlyAlerts"}`,
        text: renderBody(p, p.followup_body ?? ""),
        fromName: FROM_NAME(),
        threadId: p.gmail_thread_id ?? undefined,
        inReplyTo: initial[0]?.message_id_header ?? p.gmail_thread_id ?? undefined,
        listUnsubscribeUrl: `${appUrl()}/w/${p.visit_token}/u`,
        listUnsubscribePostUrl: `${appUrl()}/api/outreach/unsubscribe/${p.visit_token}`,
      });
      await sql()`
        INSERT INTO prospect_emails (prospect_id, direction, kind, subject, body_text,
                                     gmail_message_id, gmail_thread_id, message_id_header)
        VALUES (${p.id}, 'outbound', 'follow_up', ${p.followup_subject},
                ${renderBody(p, p.followup_body ?? "")}, ${sent.providerId},
                ${sent.threadId}, ${sent.messageIdHeader})
      `;
      await sql()`
        UPDATE prospects
        SET followup_sent_at = now(), status = 'followed_up', updated_at = now()
        WHERE id = ${p.id}
      `;
      followups++;
      budget--;
    } catch (err) {
      console.error(`prospecting: follow-up send failed for ${p.id}:`, err);
    }
  }

  const approved = (await sql()`
    SELECT * FROM prospects WHERE status = 'approved'
    ORDER BY approved_at LIMIT ${Math.max(budget, 0)}
  `) as Prospect[];

  for (const p of approved) {
    if (budget <= 0) break;
    if (!p.email || (await isSuppressed(p.email))) {
      await setStatus(p.id, "suppressed", "Suppressed before send");
      continue;
    }
    if (!p.draft_subject || !p.draft_body) {
      await setStatus(p.id, "pending_approval", "Drafts missing at send time");
      continue;
    }
    try {
      const sent = await outreachSend({
        to: p.email,
        subject: p.draft_subject,
        text: renderBody(p, p.draft_body),
        fromName: FROM_NAME(),
        listUnsubscribeUrl: `${appUrl()}/w/${p.visit_token}/u`,
        listUnsubscribePostUrl: `${appUrl()}/api/outreach/unsubscribe/${p.visit_token}`,
      });
      await sql()`
        INSERT INTO prospect_emails (prospect_id, direction, kind, subject, body_text,
                                     gmail_message_id, gmail_thread_id, message_id_header)
        VALUES (${p.id}, 'outbound', 'initial', ${p.draft_subject},
                ${renderBody(p, p.draft_body)}, ${sent.providerId},
                ${sent.threadId}, ${sent.messageIdHeader})
      `;
      await sql()`
        UPDATE prospects
        SET sent_at = now(), status = 'sent', gmail_thread_id = ${sent.threadId},
            updated_at = now()
        WHERE id = ${p.id}
      `;
      await sql()`
        UPDATE prospecting_settings SET warmup_started_at = COALESCE(warmup_started_at, now())
        WHERE id
      `;
      initials++;
      budget--;
    } catch (err) {
      console.error(`prospecting: initial send failed for ${p.id}:`, err);
    }
  }

  return { initials, followups, cap };
}

// ---------------------------------------------------------------------------

/** Heads-up email to the site admin, via the (transactional) Resend account. */
async function alertAdmin(subject: string, body: string): Promise<void> {
  try {
    await sendRawEmail({
      from: `MonthlyAlerts <${process.env.RESEND_FROM_EMAIL ?? "alerts@alerts.monthlyalerts.com"}>`,
      to: ADMIN_EMAIL,
      subject,
      text: body,
      html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escapeHtml(body)}</div>`,
    });
  } catch (err) {
    console.error("prospecting: admin alert failed:", err);
  }
}
