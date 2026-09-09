import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { readAttribution } from "@/lib/attribution";
import {
  createEmailToken,
  findUserByEmail,
  hashPassword,
  MIN_PASSWORD_LENGTH,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import { sendAccountExistsEmail, sendVerificationEmail } from "@/lib/email";
import { DEFAULT_LANG, isLang } from "@/lib/i18n";
import { PROJECT_PRICE_CENTS } from "@/lib/pricing";
import { rateLimited } from "@/lib/rate-limit";
import { grantCredit } from "@/lib/referrals";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password signup. The account stays locked (email_verified_at null) until
 * the emailed confirmation link is used. Re-signing up on an unverified
 * account just updates the password and re-sends the link. If a verified
 * account already exists, the response is indistinguishable from a fresh
 * signup (no account enumeration) and the address gets a heads-up email.
 */
export async function POST(request: Request) {
  const limited = await rateLimited("signup", 5, 15);
  if (limited) return limited;

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
    await sendAccountExistsEmail(email, existing.preferred_language ?? lang).catch((err) =>
      console.error("account-exists email failed:", err)
    );
    return NextResponse.json({ ok: true });
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

  await snapshotAttribution(email);

  const token = await createEmailToken(email, "verify");
  await sendVerificationEmail(email, token, lang);
  return NextResponse.json({ ok: true });
}

/**
 * First-touch attribution onto the new account: referral code, campaign
 * snapshot, and (for outreach prospects) the "first project on us" credit.
 * Never overwrites an earlier touch; never blocks signup.
 */
async function snapshotAttribution(email: string) {
  try {
    const attr = await readAttribution();
    if (!attr.referralCode && !attr.acquisition && !attr.prospectId) return;
    const rows = (await sql()`
      UPDATE users SET
        referred_by_code = COALESCE(referred_by_code, ${attr.referralCode}),
        acquisition = COALESCE(acquisition, ${attr.acquisition ? JSON.stringify(attr.acquisition) : null}::jsonb),
        prospect_id = COALESCE(prospect_id, ${attr.prospectId}::uuid)
      WHERE email = ${email}
      RETURNING id, prospect_id
    `) as { id: string; prospect_id: string | null }[];
    const user = rows[0];
    if (!user || !attr.prospectId || user.prospect_id !== attr.prospectId) return;

    // One comped project per prospect, granted the first time they sign up.
    const note = `outreach:${attr.prospectId}`;
    const existing = (await sql()`
      SELECT 1 FROM credit_ledger WHERE reason = 'comp' AND note = ${note}
    `) as unknown[];
    if (existing.length === 0) {
      await grantCredit({ userId: user.id, amountCents: PROJECT_PRICE_CENTS, reason: "comp", note });
    }
    await sql()`
      UPDATE prospects SET status = 'converted', converted_at = COALESCE(converted_at, now()), updated_at = now()
      WHERE id = ${attr.prospectId}
    `;
  } catch (err) {
    console.error("signup attribution failed:", err);
  }
}
