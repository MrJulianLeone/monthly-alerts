import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  findUserByEmail,
  hashPassword,
  hashToken,
  MIN_PASSWORD_LENGTH,
  startSession,
} from "@/lib/auth";
import { sql } from "@/lib/db";
import type { Lang } from "@/lib/i18n";

/**
 * Invited user without an account: creates it with the password they chose.
 * Possessing the emailed invite token proves control of the address, so the
 * email counts as verified. Their initial language is the one the owner
 * selected for the invitation (onboarding lets them change it).
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < MIN_PASSWORD_LENGTH) return jsonError("password_too_short", 400);

  const invites = (await sql()`
    SELECT id, project_id, email, role, language FROM invites
    WHERE token_hash = ${hashToken(token)}
      AND accepted_at IS NULL AND expires_at > now()
  `) as { id: string; project_id: string; email: string; role: string; language: Lang }[];
  if (invites.length === 0) return jsonError("Invite not found or expired", 404);
  const invite = invites[0];

  const existing = await findUserByEmail(invite.email);
  if (existing && existing.email_verified_at && existing.password_hash) {
    // Account already set up — they must log in and accept instead.
    return jsonError("account_exists", 409);
  }

  const rows = (await sql()`
    INSERT INTO users (email, password_hash, email_verified_at, preferred_language)
    VALUES (${invite.email}, ${hashPassword(password)}, now(), ${invite.language})
    ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          email_verified_at = COALESCE(users.email_verified_at, now()),
          deleted_at = NULL
    RETURNING id
  `) as { id: string }[];
  const userId = rows[0].id;

  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${invite.project_id}, ${userId}, ${invite.role})
    ON CONFLICT (project_id, user_id) DO NOTHING
  `;
  await sql()`UPDATE invites SET accepted_at = now() WHERE id = ${invite.id}`;

  await startSession(userId, request.headers.get("user-agent"));
  return NextResponse.json({ project_id: invite.project_id });
}
