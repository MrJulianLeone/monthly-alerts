import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { runAutoresponder } from "@/lib/autoresponder";
import { sql } from "@/lib/db";
import { resolveThreadKey, supportAddress, type SupportMessage } from "@/lib/support";

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
  const subject = str(d.subject);
  let text = str(d.text);
  let html = str(d.html);
  let messageId = str(d.message_id);
  let inReplyTo = headerValue(d.headers, "in-reply-to");
  let attachments = attachmentMeta(d.attachments);
  let allHeaders: unknown = d.headers;

  // Fetch the full email from the receiving API at most once, on demand.
  let fullCache: Record<string, unknown> | null | undefined;
  const fetchFull = async () =>
    fullCache !== undefined ? fullCache : (fullCache = resendId ? await fetchReceivedEmail(resendId) : null);

  // Resend webhooks are account-wide: every inbound email on every domain in
  // the Resend account lands here. Only keep mail actually addressed to our
  // domain. To/Cc usually carry it; for BCC/forwarded deliveries the envelope
  // recipients (received_for) on the full email are checked before dropping.
  const domain = "@" + (supportAddress().split("@")[1] ?? "monthlyalerts.com");
  const ours = (a: string) => a.toLowerCase().endsWith(domain);
  let recipients = [...addressList(d.to), ...addressList(d.cc), ...addressList(d.received_for)];
  if (!recipients.some(ours)) {
    const full = await fetchFull();
    if (full) {
      recipients = [...addressList(full.to), ...addressList(full.cc), ...addressList(full.received_for)];
    }
  }
  const toEmail = recipients.find(ours);
  if (!toEmail) {
    return NextResponse.json({ ok: true, ignored: `not addressed to ${domain}` });
  }

  // The webhook payload may omit bodies/headers; the receiving API has the
  // full parsed email.
  if (text == null && html == null) {
    const full = await fetchFull();
    if (full) {
      text ??= str(full.text);
      html ??= str(full.html);
      messageId ??= str(full.message_id);
      inReplyTo ??= headerValue(full.headers, "in-reply-to");
      if (attachments.length === 0) attachments = attachmentMeta(full.attachments);
      if (full.headers) allHeaders = full.headers;
    }
  }

  if (!fromEmail) return NextResponse.json({ ok: true, ignored: "no sender" });

  const threadKey =
    (await resolveThreadKey(fromEmail, subject ?? null, inReplyTo ?? null)) ??
    messageId ??
    crypto.randomUUID();

  // resend_id is UNIQUE — webhook retries no-op instead of duplicating.
  const inserted = (await sql()`
    INSERT INTO support_messages
      (direction, resend_id, message_id, in_reply_to, thread_key, counterparty_email,
       from_email, from_name, to_email, subject, text_body, html_body, attachments)
    VALUES
      ('inbound', ${resendId ?? null}, ${messageId ?? null}, ${inReplyTo ?? null},
       ${threadKey}, ${fromEmail.toLowerCase()}, ${fromEmail.toLowerCase()},
       ${fromName ?? null}, ${toEmail.toLowerCase()}, ${subject ?? null},
       ${text ?? null}, ${html ?? null}, ${JSON.stringify(attachments)})
    ON CONFLICT (resend_id) DO NOTHING
    RETURNING *
  `) as SupportMessage[];

  // AI triage: quarantine spam, auto-reply, or notify the admin. Awaited (the
  // serverless runtime stops at the response) and loop-guarded via the
  // Auto-Submitted/Precedence headers. Skipped entirely on webhook retries
  // (no row inserted).
  if (inserted.length > 0) {
    await runAutoresponder(inserted[0], { autoSubmitted: isAutoSubmitted(allHeaders) });
  }

  return NextResponse.json({ ok: true });
}

/** RFC 3834 & friends: auto-replies, bounces, and bulk mail mark themselves. */
function isAutoSubmitted(headers: unknown): boolean {
  const auto = headerValue(headers, "auto-submitted");
  if (auto && auto.toLowerCase() !== "no") return true;
  const precedence = headerValue(headers, "precedence");
  if (precedence && /bulk|junk|auto/i.test(precedence)) return true;
  return headerValue(headers, "x-autoreply") !== undefined ||
    headerValue(headers, "x-auto-response-suppress") !== undefined;
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

/** Normalizes a recipient field (string or array of "Name <email>") to bare emails. */
function addressList(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
  return raw
    .filter((r): r is string => typeof r === "string")
    .flatMap((r) => r.split(","))
    .map((r) => parseAddress(r).email)
    .filter((e): e is string => !!e);
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
