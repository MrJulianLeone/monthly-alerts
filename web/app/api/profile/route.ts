import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { sql } from "@/lib/db";
import { isLang } from "@/lib/i18n";

/**
 * Updates the user's profile. The onboarding form calls this with
 * onboarded: true, which stamps onboarded_at and unlocks the app.
 */
export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : undefined;
  const company =
    typeof body.company === "string" ? body.company.trim().slice(0, 120) : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : undefined;
  const language = isLang(body.preferred_language) ? body.preferred_language : undefined;
  const emailOptOut =
    typeof body.email_opt_out === "boolean" ? body.email_opt_out : undefined;
  const onboard = body.onboarded === true;

  if (onboard && (!name || !language)) {
    return jsonError("Name and language are required", 400);
  }

  await sql()`
    UPDATE users SET
      name = COALESCE(${name ?? null}, name),
      company = COALESCE(${company ?? null}, company),
      phone = COALESCE(${phone ?? null}, phone),
      preferred_language = COALESCE(${language ?? null}, preferred_language),
      email_opt_out = COALESCE(${emailOptOut ?? null}, email_opt_out),
      onboarded_at = CASE WHEN ${onboard} THEN COALESCE(onboarded_at, now()) ELSE onboarded_at END
    WHERE id = ${auth.user.id}
  `;
  return NextResponse.json({ ok: true });
}
