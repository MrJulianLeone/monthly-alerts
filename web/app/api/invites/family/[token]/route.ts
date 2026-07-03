import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashToken } from "@/lib/auth";
import { jsonError } from "@/lib/api";

type Params = { params: Promise<{ token: string }> };

/**
 * Validates a family invite link and returns everything the signup flow needs
 * to pre-fill: the invitee's email and the inviter's name and email (used as
 * the parent email when the invitee turns out to be under 16).
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;

  const rows = (await sql()`
    SELECT f.invitee_email, f.status, f.expires_at,
           u.email AS inviter_email, p.display_name AS inviter_name
    FROM family_invites f
    JOIN users u ON u.id = f.inviter_id
    LEFT JOIN profiles p ON p.user_id = f.inviter_id
    WHERE f.token_hash = ${hashToken(token)}
  `) as {
    invitee_email: string;
    status: string;
    expires_at: string;
    inviter_email: string;
    inviter_name: string | null;
  }[];

  const invite = rows[0];
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return jsonError("This invitation is invalid or has expired", 404);
  }

  return NextResponse.json({
    valid: true,
    inviteeEmail: invite.invitee_email,
    inviterName: invite.inviter_name ?? "A family member",
    inviterEmail: invite.inviter_email,
  });
}
