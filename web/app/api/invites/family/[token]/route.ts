import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ageFromDob, hashToken } from "@/lib/auth";
import { requireUser, jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

type Params = { params: Promise<{ token: string }> };

async function findInvite(token: string) {
  const rows = (await sql()`
    SELECT fi.id, fi.inviter_id, fi.invitee_email, fi.relationship, fi.status, fi.expires_at,
           p.display_name AS inviter_name
    FROM family_invites fi
    LEFT JOIN profiles p ON p.user_id = fi.inviter_id
    WHERE fi.token_hash = ${hashToken(token)}
  `) as {
    id: string;
    inviter_id: string;
    invitee_email: string;
    relationship: "family" | "parent";
    status: string;
    expires_at: string;
    inviter_name: string | null;
  }[];
  const invite = rows[0];
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return null;
  }
  return invite;
}

/** Validate a family invite link (public — shown before login/signup). */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite) return jsonError("This invitation is invalid or has expired", 404);
  return NextResponse.json({
    valid: true,
    relationship: invite.relationship,
    inviterName: invite.inviter_name ?? "A family member",
    inviteeEmail: invite.invitee_email,
  });
}

/**
 * Accept or decline a family invitation (requires a signed-in account —
 * invitees without an account sign up first, then return to accept).
 * For a 'parent' invite, the accepting adult is saved as the (minor) inviter's
 * parent and gains the parent dashboard. Body: { action: "accept" | "decline" }
 */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;
  const { token } = await params;

  const invite = await findInvite(token);
  if (!invite) return jsonError("This invitation is invalid or has expired", 404);

  if (invite.inviter_id === auth.user.id) {
    return jsonError("You can't accept your own invitation", 400);
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action === "decline" ? "declined" : "accepted";

  if (action === "accepted" && invite.relationship === "parent") {
    // Granting parent/guardian oversight of a minor is sensitive: the account
    // accepting must be the invited address and must be an adult.
    if (auth.user.email.toLowerCase() !== invite.invitee_email.toLowerCase()) {
      return jsonError(
        "Please accept while signed in with the invited email address.",
        403
      );
    }
    const accepterAge =
      auth.user.date_of_birth !== null ? ageFromDob(auth.user.date_of_birth) : null;
    const accepterIsAdult =
      auth.user.role === "parent" ||
      auth.user.role === "admin" ||
      (accepterAge !== null && accepterAge >= 18);
    if (!accepterIsAdult) {
      return jsonError("Only an adult can become a parent on MonthlyAlerts.", 403);
    }

    // Link the minor to this parent (only if they still have no parent), and
    // give the parent dashboard access. The parent keeps any coaching profile.
    await sql()`
      UPDATE users SET parent_id = ${auth.user.id}
      WHERE id = ${invite.inviter_id} AND parent_id IS NULL AND deleted_at IS NULL
    `;
    if (auth.user.role === "user") {
      await sql()`UPDATE users SET role = 'parent' WHERE id = ${auth.user.id}`;
    }
  }

  await sql()`
    UPDATE family_invites
    SET status = ${action}, responded_at = now(), invitee_user_id = ${auth.user.id}
    WHERE id = ${invite.id}
  `;

  await trackEvent(
    request,
    action === "accepted" ? "family_invite_accepted" : "family_invite_declined",
    auth.user.id
  );

  return NextResponse.json({ ok: true, status: action, relationship: invite.relationship });
}
