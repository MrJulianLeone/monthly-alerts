import { escapeHtml, sendRawEmail } from "@/lib/email";
import { sql } from "@/lib/db";

// Support inbox data layer. See the support_messages comment in db/schema.sql
// for the threading model.

export type SupportMessage = {
  id: string;
  direction: "inbound" | "outbound";
  resend_id: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  thread_key: string;
  counterparty_email: string;
  from_email: string;
  from_name: string | null;
  to_email: string;
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  attachments: { filename?: string; content_type?: string; size?: number }[];
  read_at: string | null;
  created_at: string;
};

export type SupportThread = {
  thread_key: string;
  counterparty_email: string;
  subject: string | null;
  last_direction: "inbound" | "outbound";
  last_preview: string | null;
  last_at: string;
  message_count: number;
  unread_count: number;
};

export function supportAddress(): string {
  return process.env.SUPPORT_EMAIL ?? "support@monthlyalerts.com";
}

export function supportFrom(): string {
  const name = process.env.RESEND_FROM_NAME ?? "MonthlyAlerts";
  return `${name} Support <${supportAddress()}>`;
}

/** "Re: Re: Fwd: Hello" -> "hello", for fallback thread matching. */
export function normalizeSubject(subject: string | null | undefined): string {
  return (subject ?? "")
    .replace(/^(\s*(re|fwd?|aw|sv|rif|r)\s*:\s*)+/i, "")
    .trim()
    .toLowerCase();
}

/**
 * Finds the thread a new message belongs to: In-Reply-To match first, then
 * the latest thread with the same counterparty and normalized subject.
 * Returns null when the message starts a new thread.
 */
export async function resolveThreadKey(
  counterparty: string,
  subject: string | null,
  inReplyTo: string | null
): Promise<string | null> {
  if (inReplyTo) {
    const rows = (await sql()`
      SELECT thread_key FROM support_messages WHERE message_id = ${inReplyTo} LIMIT 1
    `) as { thread_key: string }[];
    if (rows.length > 0) return rows[0].thread_key;
  }
  const norm = normalizeSubject(subject);
  if (norm) {
    const rows = (await sql()`
      SELECT thread_key FROM support_messages
      WHERE counterparty_email = ${counterparty.toLowerCase()}
        AND lower(trim(regexp_replace(coalesce(subject, ''), '^(\\s*(re|fwd?|aw|sv|rif|r)\\s*:\\s*)+', '', 'i'))) = ${norm}
      ORDER BY created_at DESC LIMIT 1
    `) as { thread_key: string }[];
    if (rows.length > 0) return rows[0].thread_key;
  }
  return null;
}

export async function listThreads(): Promise<SupportThread[]> {
  return (await sql()`
    SELECT t.thread_key, t.last_at, t.message_count, t.unread_count,
           m.counterparty_email, m.subject, m.direction AS last_direction,
           left(coalesce(m.text_body, ''), 140) AS last_preview
    FROM (
      SELECT thread_key,
             max(created_at) AS last_at,
             count(*)::int AS message_count,
             (count(*) FILTER (WHERE direction = 'inbound' AND read_at IS NULL))::int AS unread_count
      FROM support_messages
      GROUP BY thread_key
    ) t
    JOIN LATERAL (
      SELECT counterparty_email, subject, direction, text_body
      FROM support_messages
      WHERE thread_key = t.thread_key
      ORDER BY created_at DESC LIMIT 1
    ) m ON true
    ORDER BY t.last_at DESC
  `) as SupportThread[];
}

export async function getThreadMessages(threadKey: string): Promise<SupportMessage[]> {
  return (await sql()`
    SELECT * FROM support_messages
    WHERE thread_key = ${threadKey}
    ORDER BY created_at ASC
  `) as SupportMessage[];
}

export async function markThreadRead(threadKey: string): Promise<void> {
  await sql()`
    UPDATE support_messages SET read_at = now()
    WHERE thread_key = ${threadKey} AND direction = 'inbound' AND read_at IS NULL
  `;
}

export async function countUnread(): Promise<number> {
  // Fails soft so the admin dashboard still renders on a database that
  // hasn't had the support_messages migration applied yet.
  try {
    const rows = (await sql()`
      SELECT count(*)::int AS n FROM support_messages
      WHERE direction = 'inbound' AND read_at IS NULL
    `) as { n: number }[];
    return rows[0]?.n ?? 0;
  } catch (err) {
    console.error("countUnread failed (support_messages migration missing?)", err);
    return 0;
  }
}

/**
 * Sends a support email (new message or reply into an existing thread) and
 * records it. For replies, In-Reply-To/References point at the latest inbound
 * message so the recipient's mail client threads it correctly.
 */
export async function sendSupportMessage(opts: {
  to: string;
  subject: string;
  body: string; // plain text as typed in the admin composer
  threadKey?: string; // omitted = start a new thread
}): Promise<SupportMessage> {
  const to = opts.to.trim().toLowerCase();
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escapeHtml(opts.body)}</div>`;

  let headers: Record<string, string> | undefined;
  if (opts.threadKey) {
    const rows = (await sql()`
      SELECT message_id FROM support_messages
      WHERE thread_key = ${opts.threadKey} AND direction = 'inbound' AND message_id IS NOT NULL
      ORDER BY created_at DESC LIMIT 1
    `) as { message_id: string }[];
    if (rows.length > 0) {
      headers = { "In-Reply-To": rows[0].message_id, References: rows[0].message_id };
    }
  }

  const sent = await sendRawEmail({
    from: supportFrom(),
    to,
    subject: opts.subject,
    html,
    text: opts.body,
    headers,
  });

  const rows = (await sql()`
    INSERT INTO support_messages
      (direction, resend_id, in_reply_to, thread_key, counterparty_email,
       from_email, from_name, to_email, subject, text_body, html_body)
    VALUES
      ('outbound', ${sent?.id ?? null}, ${headers?.["In-Reply-To"] ?? null},
       ${opts.threadKey ?? crypto.randomUUID()}, ${to},
       ${supportAddress()}, ${process.env.RESEND_FROM_NAME ?? "MonthlyAlerts"},
       ${to}, ${opts.subject}, ${opts.body}, ${html})
    RETURNING *
  `) as SupportMessage[];
  return rows[0];
}
