import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { generateToken, hashToken } from "@/lib/auth";
import { sql } from "@/lib/db";
import { sendInviteEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVITE_DAYS = 14;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "owner", { write: true });
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body.role === "editor" ? "editor" : "commenter";
  if (!EMAIL_RE.test(email)) return jsonError("Invalid email", 400);

  const existing = (await sql()`
    SELECT 1 FROM project_members m JOIN users u ON u.id = m.user_id
    WHERE m.project_id = ${id} AND u.email = ${email}
  `) as unknown[];
  if (existing.length > 0) return jsonError("Already a member", 409);

  // Replace any previous pending invite for this address.
  await sql()`
    DELETE FROM invites
    WHERE project_id = ${id} AND email = ${email} AND accepted_at IS NULL
  `;

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  await sql()`
    INSERT INTO invites (project_id, email, role, token_hash, invited_by, expires_at)
    VALUES (${id}, ${email}, ${role}, ${hashToken(token)}, ${auth.user.id},
            ${expiresAt.toISOString()})
  `;
  await sendInviteEmail(
    email,
    auth.user.name ?? auth.user.email,
    auth.project.name,
    role,
    token
  );
  return NextResponse.json({ ok: true });
}
