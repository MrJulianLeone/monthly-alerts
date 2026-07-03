import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashToken } from "@/lib/auth";
import { requireUser, jsonError } from "@/lib/api";

const MAX_LEADERBOARDS_PER_USER = 3;

type Params = { params: Promise<{ token: string }> };

async function findReferral(token: string) {
  const rows = (await sql()`
    SELECT r.id, r.leaderboard_id, r.invitee_email, r.status, r.expires_at,
           l.name AS leaderboard_name,
           p.display_name AS referrer_name
    FROM referrals r
    JOIN leaderboards l ON l.id = r.leaderboard_id
    LEFT JOIN profiles p ON p.user_id = r.referrer_id
    WHERE r.token_hash = ${hashToken(token)}
  `) as {
    id: string;
    leaderboard_id: string;
    invitee_email: string;
    status: string;
    expires_at: string;
    leaderboard_name: string;
    referrer_name: string | null;
  }[];
  const referral = rows[0];
  if (!referral || referral.status !== "pending" || new Date(referral.expires_at) < new Date()) {
    return null;
  }
  return referral;
}

/** Validate an invite link (public — shown before login/signup). */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const referral = await findReferral(token);
  if (!referral) return jsonError("This invitation is invalid or has expired", 404);
  return NextResponse.json({
    valid: true,
    leaderboardName: referral.leaderboard_name,
    referrerName: referral.referrer_name ?? "A friend",
    inviteeEmail: referral.invitee_email,
  });
}

/**
 * Accept or decline an invitation (requires a signed-in account — invitees
 * without an account sign up first, then accept).
 * Body: { action: "accept" | "decline" }
 */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;
  const { token } = await params;

  const referral = await findReferral(token);
  if (!referral) return jsonError("This invitation is invalid or has expired", 404);

  const body = await request.json().catch(() => ({}));
  const action = body.action === "decline" ? "declined" : "accepted";

  if (action === "accepted") {
    const count = (await sql()`
      SELECT count(*)::int AS n FROM leaderboard_members
      WHERE user_id = ${auth.user.id} AND left_at IS NULL
    `) as { n: number }[];
    if (count[0].n >= MAX_LEADERBOARDS_PER_USER) {
      return jsonError(`You can be in at most ${MAX_LEADERBOARDS_PER_USER} leaderboards`, 409);
    }
    await sql()`
      INSERT INTO leaderboard_members (leaderboard_id, user_id)
      VALUES (${referral.leaderboard_id}, ${auth.user.id})
      ON CONFLICT (leaderboard_id, user_id) DO UPDATE SET left_at = NULL, joined_at = now()
    `;
  }

  await sql()`
    UPDATE referrals
    SET status = ${action}, responded_at = now(), invitee_user_id = ${auth.user.id}
    WHERE id = ${referral.id}
  `;

  return NextResponse.json({ ok: true, status: action, leaderboardId: referral.leaderboard_id });
}
