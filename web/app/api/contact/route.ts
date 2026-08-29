import { NextResponse } from "next/server";
import { runAutoresponder } from "@/lib/autoresponder";
import { jsonError } from "@/lib/api";
import { verifyContactToken } from "@/lib/contact-token";
import { sql } from "@/lib/db";
import { rateLimited } from "@/lib/rate-limit";
import { resolveThreadKey, supportAddress, type SupportMessage } from "@/lib/support";

export const maxDuration = 30;

/**
 * Public contact form. Submissions become inbound support messages and run
 * through the same AI triage as email (spam quarantine / auto-reply / admin
 * alert). Spam protection: honeypot field, signed minimum-age token, and IP
 * rate limiting — the AI classifier is the last line.
 */
export async function POST(request: Request) {
  const limited = await rateLimited("contact", 3, 60);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const subject =
    typeof body?.subject === "string" && body.subject.trim() !== ""
      ? body.subject.trim().slice(0, 150)
      : "Contact form message";
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 8000) : "";
  const website = typeof body?.website === "string" ? body.website : ""; // honeypot
  const token = typeof body?.token === "string" ? body.token : "";

  // Honeypot filled or token invalid: claim success, store nothing.
  if (website !== "" || !verifyContactToken(token)) {
    return NextResponse.json({ ok: true });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Valid email required");
  if (!message) return jsonError("Message required");

  const threadKey =
    (await resolveThreadKey(email, subject, null)) ?? crypto.randomUUID();

  const inserted = (await sql()`
    INSERT INTO support_messages
      (direction, thread_key, counterparty_email, from_email, from_name,
       to_email, subject, text_body)
    VALUES
      ('inbound', ${threadKey}, ${email}, ${email}, ${name || null},
       ${supportAddress()}, ${subject}, ${message})
    RETURNING *
  `) as SupportMessage[];

  await runAutoresponder(inserted[0]);

  return NextResponse.json({ ok: true });
}
