import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { ageFromDob } from "@/lib/auth";
import { sendFamilyInviteEmail } from "@/lib/email";
import { trackEvent } from "@/lib/geo";

const MAX_PER_DAY = 10;

/**
 * Family invite (adults only): emails a family member an invitation to join
 * MonthlyAlerts with their own account. Body: { email }
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const isAdult =
    auth.user.role === "parent" ||
    auth.user.role === "admin" ||
    (auth.user.date_of_birth !== null && ageFromDob(auth.user.date_of_birth) >= 18);
  if (!isAdult) {
    return jsonError("Family invites are available on adult accounts only", 403);
  }

  const body = await request.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return jsonError("A valid email is required");
  }
  if (email.toLowerCase() === auth.user.email.toLowerCase()) {
    return jsonError("You can't invite yourself");
  }

  const existing = (await sql()`
    SELECT 1 FROM users WHERE email = ${email} AND deleted_at IS NULL
  `) as unknown[];
  if (existing.length > 0) {
    return jsonError("That family member already has a MonthlyAlerts account", 409);
  }

  // Light abuse guard: cap sends per user per day (tracked via analytics).
  const sentToday = (await sql()`
    SELECT count(*)::int AS n FROM analytics_events
    WHERE user_id = ${auth.user.id} AND event = 'family_invite_sent'
      AND created_at > now() - interval '1 day'
  `) as { n: number }[];
  if (sentToday[0].n >= MAX_PER_DAY) {
    return jsonError("You've sent a lot of invites today — try again tomorrow.", 429);
  }

  const nameRows = (await sql()`
    SELECT display_name FROM profiles WHERE user_id = ${auth.user.id}
  `) as { display_name: string }[];
  const inviterName = nameRows[0]?.display_name ?? "A family member";

  try {
    await sendFamilyInviteEmail(email, inviterName);
  } catch (error) {
    console.error("Family invite email failed:", error);
    return jsonError("We couldn't send the invitation email right now. Please try again.", 502);
  }
  await trackEvent(request, "family_invite_sent", auth.user.id);

  return NextResponse.json({ ok: true }, { status: 201 });
}
