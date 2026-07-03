import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { ageFromDob, generateToken, hashToken } from "@/lib/auth";
import { sendFamilyInviteEmail } from "@/lib/email";
import { trackEvent } from "@/lib/geo";

const MAX_PER_DAY = 10;
const INVITE_DAYS = 14;

/**
 * Family invite: emails a family member a tokened invitation. Adults invite
 * other adults to start their own coaching. A minor (under 18) with no parent
 * yet invites an adult who becomes their parent/guardian on accept. Body: { email }
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const age =
    auth.user.date_of_birth !== null ? ageFromDob(auth.user.date_of_birth) : null;
  const isAdult =
    auth.user.role === "parent" ||
    auth.user.role === "admin" ||
    (age !== null && age >= 18);
  // A minor with no parent yet is inviting the adult who will become their parent.
  const asParent = !isAdult && auth.user.parent_id === null;

  const body = await request.json().catch(() => null);
  const email = body?.email;
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return jsonError("A valid email is required");
  }
  if (email.toLowerCase() === auth.user.email.toLowerCase()) {
    return jsonError("You can't invite yourself");
  }

  // Adults can only invite family to their own account; a minor who already
  // has a parent invites family the same way. Only a parentless minor may
  // invite someone to become their parent.
  const relationship = asParent ? "parent" : "family";

  if (relationship === "family") {
    const existing = (await sql()`
      SELECT 1 FROM users WHERE email = ${email} AND deleted_at IS NULL
    `) as unknown[];
    if (existing.length > 0) {
      return jsonError("That family member already has a MonthlyAlerts account", 409);
    }
  }

  // Don't send duplicate pending invites to the same address from this user.
  const dup = (await sql()`
    SELECT 1 FROM family_invites
    WHERE inviter_id = ${auth.user.id} AND invitee_email = ${email}
      AND status = 'pending' AND expires_at > now()
  `) as unknown[];
  if (dup.length > 0) {
    return jsonError("You already have a pending invite to this address", 409);
  }

  // Light abuse guard: cap sends per user per day.
  const sentToday = (await sql()`
    SELECT count(*)::int AS n FROM family_invites
    WHERE inviter_id = ${auth.user.id} AND created_at > now() - interval '1 day'
  `) as { n: number }[];
  if (sentToday[0].n >= MAX_PER_DAY) {
    return jsonError("You've sent a lot of invites today — try again tomorrow.", 429);
  }

  const nameRows = (await sql()`
    SELECT display_name FROM profiles WHERE user_id = ${auth.user.id}
  `) as { display_name: string }[];
  const inviterName = nameRows[0]?.display_name ?? "A family member";

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  const inserted = (await sql()`
    INSERT INTO family_invites (inviter_id, invitee_email, relationship, token_hash, expires_at)
    VALUES (${auth.user.id}, ${email}, ${relationship}, ${hashToken(token)}, ${expiresAt.toISOString()})
    RETURNING id
  `) as { id: string }[];

  try {
    await sendFamilyInviteEmail(email, inviterName, token, asParent);
  } catch (error) {
    // Don't leave an unusable pending invite behind, and tell the user the truth.
    await sql()`DELETE FROM family_invites WHERE id = ${inserted[0].id}`.catch(() => {});
    console.error("Family invite email failed:", error);
    return jsonError("We couldn't send the invitation email right now. Please try again.", 502);
  }
  await trackEvent(request, "family_invite_sent", auth.user.id);

  return NextResponse.json({ ok: true, relationship }, { status: 201 });
}
