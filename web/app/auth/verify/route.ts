import { NextResponse } from "next/server";
import { consumeEmailToken, startSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { appUrl } from "@/lib/email";

/**
 * Email-confirmation landing for new signups. Consuming the token verifies
 * the address, signs the user in, and routes first-timers to onboarding.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const consumed = token ? await consumeEmailToken(token, "verify") : null;
  if (!consumed) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid`);
  }

  const rows = (await sql()`
    UPDATE users
    SET email_verified_at = COALESCE(email_verified_at, now())
    WHERE email = ${consumed.email} AND deleted_at IS NULL
    RETURNING id, onboarded_at
  `) as { id: string; onboarded_at: string | null }[];
  if (rows.length === 0) {
    return NextResponse.redirect(`${appUrl()}/login?error=invalid`);
  }

  await startSession(rows[0].id, request.headers.get("user-agent"));
  const next = consumed.redirect ?? "/dashboard";
  const dest = rows[0].onboarded_at ? next : `/welcome?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${appUrl()}${dest}`);
}
