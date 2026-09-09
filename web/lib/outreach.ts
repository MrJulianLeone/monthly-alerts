import { randomUUID } from "node:crypto";
import { sendRawEmail } from "@/lib/email";

/**
 * Outreach transport: cold emails go out through Resend from an address on
 * monthlyalerts.com itself (default julian@monthlyalerts.com), the same
 * domain the product's transactional mail uses. Because a spam problem here
 * would hurt invites and password resets too, sending is fenced in:
 *
 *   - OUTREACH_ENABLED=true is required; nothing sends until the owner flips it.
 *   - Every draft is approved by hand before it can send.
 *   - Warm-up ramp (5 → 8 → 12 → cap per day), hard ceiling in HARD_DAILY_MAX,
 *     weekdays only, one send per prospect per stage.
 *   - RFC 8058 one-click List-Unsubscribe plus a footer link on every email.
 *   - Any spam complaint (Resend email.complained webhook) pauses the pipeline
 *     and alerts the admin; bounces over 5% in 7 days do the same.
 *   - Replies come back through the same domain's inbound webhook and never
 *     get the support autoresponder.
 *
 * Text-only, one recipient per call, no tracking pixels, no link tracking.
 */

export const HARD_DAILY_MAX = 30;

export function outreachEnabled(): boolean {
  return process.env.OUTREACH_ENABLED === "true";
}

/** Sending is possible: switched on and Resend is available. */
export function outreachConfigured(): boolean {
  return outreachEnabled() && Boolean(process.env.RESEND_API_KEY);
}

/** The From / Reply-To address for outreach (an address on our own domain). */
export function outreachAddress(): string {
  const configured = process.env.OUTREACH_FROM_EMAIL?.trim().toLowerCase();
  if (configured && configured.includes("@")) return configured;
  const domain = (process.env.SUPPORT_EMAIL ?? "support@monthlyalerts.com").split("@")[1];
  return `julian@${domain}`;
}

export function outreachFromName(): string {
  return process.env.OUTREACH_FROM_NAME ?? "Julian";
}

/** Sanity check used by the setup page: what a send would go out as. */
export async function outreachProfile(): Promise<{ emailAddress: string; fromName: string }> {
  return { emailAddress: outreachAddress(), fromName: outreachFromName() };
}

export type OutreachSent = {
  /** Resend email id — stored for bounce/complaint webhook matching. */
  providerId: string;
  /** Our own RFC 5322 Message-ID, so follow-ups can thread onto this send. */
  messageIdHeader: string;
  /** Thread key: the initial email's Message-ID (or the one passed in). */
  threadId: string;
};

/**
 * Sends one plain-text outreach email. Pass inReplyTo (the initial's
 * Message-ID) for a follow-up so it threads in the recipient's client.
 */
export async function outreachSend(opts: {
  to: string;
  subject: string;
  text: string;
  fromName?: string;
  threadId?: string;
  inReplyTo?: string;
  listUnsubscribeUrl?: string;
  listUnsubscribePostUrl?: string;
}): Promise<OutreachSent> {
  if (!outreachConfigured()) throw new Error("Outreach sending is not enabled");
  const address = outreachAddress();
  const domain = address.split("@")[1];
  const messageId = `<${randomUUID()}@${domain}>`;

  const headers: Record<string, string> = { "Message-ID": messageId };
  if (opts.inReplyTo) {
    headers["In-Reply-To"] = opts.inReplyTo;
    headers.References = opts.inReplyTo;
  }
  if (opts.listUnsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${opts.listUnsubscribeUrl}>`;
    if (opts.listUnsubscribePostUrl) {
      // RFC 8058: mailbox providers show a native "Unsubscribe" button and
      // POST to this URL — required by Gmail/Yahoo for bulk senders.
      headers["List-Unsubscribe"] = `<${opts.listUnsubscribePostUrl}>, <${opts.listUnsubscribeUrl}>`;
      headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }
  }

  const name = (opts.fromName ?? outreachFromName()).replace(/["<>]/g, "");
  const sent = await sendRawEmail({
    from: `${name} <${address}>`,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    // Resend requires an HTML part; keep it a faithful plain rendering.
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escape(opts.text)}</div>`,
    headers,
    replyTo: address,
  });

  return {
    providerId: sent?.id ?? `disabled-${randomUUID()}`,
    messageIdHeader: messageId,
    threadId: opts.threadId ?? messageId,
  };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" style="color:#1c1917">${url}</a>`);
}

/** True when the sending window is open (Mon–Fri, UTC). */
export function inSendWindow(now = new Date()): boolean {
  const day = now.getUTCDay();
  return day >= 1 && day <= 5;
}
