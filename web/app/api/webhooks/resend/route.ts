import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { resolveThreadKey, supportAddress } from "@/lib/support";

export const maxDuration = 30;

/**
 * Resend inbound-email webhook (email.received). Stores mail sent to the
 * support address in support_messages for the admin inbox. Signed with the
 * svix scheme; RESEND_WEBHOOK_SECRET comes from the webhook's page in the
 * Resend dashboard.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  // Signature is over the raw body — read it before parsing.
  const payload = await request.text();
  if (!verifySvix(secret, request.headers, payload)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (event.type !== "email.received" || !event.data) {
    return NextResponse.json({ ok: true, ignored: event.type ?? "unknown" });
  }

  const d = event.data;
  const resendId = str(d.email_id) ?? str(d.id);
  const { name: fromName, email: fromEmail } = parseAddress(str(d.from) ?? "");
  const toEmail = firstAddress(d.to) ?? supportAddress();
  const subject = str(d.subject);
  let text = str(d.text);
  let html = str(d.html);
  let messageId = str(d.message_id);
  let inReplyTo = headerValue(d.headers, "in-reply-to");
  let attachments = attachmentMeta(d.attachments);

  // The webhook payload may omit bodies/headers; the receiving API has the
  // full parsed email.
  if (resendId && text == null && html == null) {
    const full = await fetchReceivedEmail(resendId);
    if (full) {
      text ??= str(full.text);
      html ??= str(full.html);
      messageId ??= str(full.message_id);
      inReplyTo ??= headerValue(full.headers, "in-reply-to");
      if (attachments.length === 0) attachments = attachmentMeta(full.attachments);
    }
  }

  if (!fromEmail) return NextResponse.json({ ok: true, ignored: "no sender" });

  const threadKey =
    (await resolveThreadKey(fromEmail, subject ?? null, inReplyTo ?? null)) ??
    messageId ??
    crypto.randomUUID();

  // resend_id is UNIQUE — webhook retries no-op instead of duplicating.
  await sql()`
    INSERT INTO support_messages
      (direction, resend_id, message_id, in_reply_to, thread_key, counterparty_email,
       from_email, from_name, to_email, subject, text_body, html_body, attachments)
    VALUES
      ('inbound', ${resendId ?? null}, ${messageId ?? null}, ${inReplyTo ?? null},
       ${threadKey}, ${fromEmail.toLowerCase()}, ${fromEmail.toLowerCase()},
       ${fromName ?? null}, ${toEmail.toLowerCase()}, ${subject ?? null},
       ${text ?? null}, ${html ?? null}, ${JSON.stringify(attachments)})
    ON CONFLICT (resend_id) DO NOTHING
  `;

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Svix signature scheme (used by Resend): HMAC-SHA256 over "id.timestamp.body"
// with the base64 key from the whsec_ secret; header carries "v1,<base64sig>"
// entries. Verified manually to avoid a dependency on the svix package.
// ---------------------------------------------------------------------------

function verifySvix(secret: string, headers: Headers, payload: string): boolean {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !timestamp || !signatures) return false;

  // Reject stale timestamps (replay protection).
  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest();

  return signatures.split(" ").some((part) => {
    const [version, sig] = part.split(",");
    if (version !== "v1" || !sig) return false;
    const given = Buffer.from(sig, "base64");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

// ---------------------------------------------------------------------------
// Defensive payload parsing
// ---------------------------------------------------------------------------

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** "Jane Doe <jane@x.com>" -> { name, email }; bare addresses pass through. */
function parseAddress(raw: string): { name?: string; email?: string } {
  const match = raw.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  if (match) {
    const name = match[1]?.trim();
    return { name: name || undefined, email: match[2].trim() };
  }
  const bare = raw.trim();
  return bare.includes("@") ? { email: bare } : {};
}

function firstAddress(v: unknown): string | undefined {
  const raw = Array.isArray(v) ? v[0] : v;
  return typeof raw === "string" ? parseAddress(raw).email : undefined;
}

/** headers may arrive as an object map or as [{name, value}] — handle both. */
function headerValue(headers: unknown, wanted: string): string | undefined {
  if (Array.isArray(headers)) {
    for (const h of headers) {
      if (
        h &&
        typeof h === "object" &&
        String((h as Record<string, unknown>).name).toLowerCase() === wanted
      ) {
        return str((h as Record<string, unknown>).value);
      }
    }
    return undefined;
  }
  if (headers && typeof headers === "object") {
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === wanted) return str(v);
    }
  }
  return undefined;
}

function attachmentMeta(v: unknown): { filename?: string; content_type?: string; size?: number }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((a): a is Record<string, unknown> => !!a && typeof a === "object")
    .map((a) => ({
      filename: str(a.filename),
      content_type: str(a.content_type) ?? str(a.contentType),
      size: typeof a.size === "number" ? a.size : undefined,
    }));
}

async function fetchReceivedEmail(id: string): Promise<Record<string, unknown> | null> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.resend.com/emails/receiving/${id}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
