import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { hashToken } from "@/lib/auth";
import { sql } from "@/lib/db";

/**
 * Accepts an invitation. The caller must be logged in with the invited email —
 * the magic-link flow on the invite page guarantees the address is confirmed.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return jsonError("Missing token", 400);

  const rows = (await sql()`
    SELECT id, project_id, email, role FROM invites
    WHERE token_hash = ${hashToken(token)}
      AND accepted_at IS NULL AND expires_at > now()
  `) as { id: string; project_id: string; email: string; role: string }[];
  if (rows.length === 0) return jsonError("Invite not found or expired", 404);
  const invite = rows[0];

  if (invite.email !== auth.user.email) {
    return jsonError("Logged in with a different email than the invitation", 403);
  }

  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${invite.project_id}, ${auth.user.id}, ${invite.role})
    ON CONFLICT (project_id, user_id) DO NOTHING
  `;
  await sql()`UPDATE invites SET accepted_at = now() WHERE id = ${invite.id}`;
  return NextResponse.json({ project_id: invite.project_id });
}
