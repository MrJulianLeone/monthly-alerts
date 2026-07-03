import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth";
import { requireUser, jsonError } from "@/lib/api";
import { sendReferralEmail } from "@/lib/email";
import { trackEvent } from "@/lib/geo";

const INVITE_DAYS = 14;

/** Refer a friend to one of my leaderboards. Body: { email, leaderboardId } */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const email = body?.email;
  const leaderboardId = body?.leaderboardId;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return jsonError("A valid email is required");
  if (!leaderboardId) return jsonError("leaderboardId is required");
  if (email.toLowerCase() === auth.user.email.toLowerCase()) {
    return jsonError("You can't refer yourself");
  }

  const membership = (await sql()`
    SELECT l.name FROM leaderboards l
    JOIN leaderboard_members m ON m.leaderboard_id = l.id
    WHERE l.id = ${leaderboardId} AND m.user_id = ${auth.user.id} AND m.left_at IS NULL
  `) as { name: string }[];
  if (membership.length === 0) return jsonError("You are not a member of this leaderboard", 403);

  const dup = (await sql()`
    SELECT 1 FROM referrals
    WHERE leaderboard_id = ${leaderboardId} AND invitee_email = ${email}
      AND status = 'pending' AND expires_at > now()
  `) as unknown[];
  if (dup.length > 0) return jsonError("This friend already has a pending invite", 409);

  const nameRows = (await sql()`
    SELECT display_name FROM profiles WHERE user_id = ${auth.user.id}
  `) as { display_name: string }[];
  const referrerName = nameRows[0]?.display_name ?? "A friend";

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  await sql()`
    INSERT INTO referrals (referrer_id, leaderboard_id, invitee_email, token_hash, expires_at)
    VALUES (${auth.user.id}, ${leaderboardId}, ${email}, ${hashToken(token)}, ${expiresAt.toISOString()})
  `;

  await sendReferralEmail(email, referrerName, membership[0].name, token);
  await trackEvent(request, "referral_sent", auth.user.id);

  return NextResponse.json({ ok: true }, { status: 201 });
}

/** My sent referrals and their statuses. */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const referrals = (await sql()`
    SELECT r.id, r.invitee_email, r.status, r.created_at, r.responded_at, l.name AS leaderboard_name
    FROM referrals r JOIN leaderboards l ON l.id = r.leaderboard_id
    WHERE r.referrer_id = ${auth.user.id}
    ORDER BY r.created_at DESC LIMIT 50
  `) as Record<string, unknown>[];

  return NextResponse.json({ referrals });
}
