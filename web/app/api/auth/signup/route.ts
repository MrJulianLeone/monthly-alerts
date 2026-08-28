import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  createEmailToken,
  findUserByEmail,
  hashPassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";
import { DEFAULT_LANG, isLang } from "@/lib/i18n";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password signup. The account stays locked (email_verified_at null) until
 * the emailed confirmation link is used. Re-signing up on an unverified
 * account just updates the password and re-sends the link.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const lang = isLang(body.lang) ? body.lang : DEFAULT_LANG;

  if (!EMAIL_RE.test(email)) return jsonError("Invalid email", 400);
  if (password.length < MIN_PASSWORD_LENGTH) {
    return jsonError("password_too_short", 400);
  }

  const existing = await findUserByEmail(email);
  if (existing && existing.email_verified_at) {
    // Verified accounts can't be re-registered (that would allow takeover).
    return jsonError("account_exists", 409);
  }

  const passwordHash = hashPassword(password);
  await sql()`
    INSERT INTO users (email, password_hash, preferred_language)
    VALUES (${email}, ${passwordHash}, ${lang})
    ON CONFLICT (email) DO UPDATE
      SET password_hash = ${passwordHash},
          preferred_language = ${lang},
          deleted_at = NULL
  `;

  const token = await createEmailToken(email, "verify");
  await sendVerificationEmail(email, token, lang);
  return NextResponse.json({ ok: true });
}
