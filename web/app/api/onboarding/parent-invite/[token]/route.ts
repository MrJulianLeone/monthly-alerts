import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  ageFromDob,
  createSession,
  hashPassword,
  hashToken,
  setSessionCookie,
} from "@/lib/auth";
import { createCoachedUser } from "@/lib/onboarding";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

type Params = { params: Promise<{ token: string }> };

async function findInvite(token: string) {
  const rows = (await sql()`
    SELECT id, parent_email, status, expires_at FROM parent_invites
    WHERE token_hash = ${hashToken(token)}
  `) as { id: string; parent_email: string; status: string; expires_at: string }[];
  const invite = rows[0];
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return null;
  }
  return invite;
}

/** Validates a parent setup link (used by the setup page). */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite) return jsonError("This setup link is invalid or has expired", 404);
  return NextResponse.json({ valid: true, parentEmail: invite.parent_email });
}

/**
 * Parent completes setup: creates (or reuses) the parent account, creates the
 * child account with profile + credentials, and signs the parent in.
 * Body: { parentPassword, child: { email, password, displayName, dateOfBirth,
 *         gender?, heightCm?, weightKg?, goal?, timezone? } }
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite) return jsonError("This setup link is invalid or has expired", 404);

  const body = await request.json().catch(() => null);
  const child = body?.child;
  if (!child?.email || !child?.password || !child?.displayName || !child?.dateOfBirth) {
    return jsonError("Child email, password, name, and date of birth are required");
  }
  if (isNaN(Date.parse(child.dateOfBirth))) return jsonError("Invalid date of birth");
  const age = ageFromDob(child.dateOfBirth);
  if (age < 11) return jsonError("MonthlyAlerts supports children aged 11 and up");
  if (age >= 16) {
    return jsonError("This user can sign up on their own — parent setup is for under-16s");
  }
  if (String(child.password).length < 8) {
    return jsonError("Child password must be at least 8 characters");
  }

  const childExists = (await sql()`
    SELECT id FROM users WHERE email = ${child.email}
  `) as { id: string }[];
  if (childExists.length > 0) return jsonError("An account with the child's email already exists", 409);

  // Reuse an existing parent account or create one.
  const existingParent = (await sql()`
    SELECT id, role FROM users WHERE email = ${invite.parent_email} AND deleted_at IS NULL
  `) as { id: string; role: string }[];

  let parentId: string;
  if (existingParent.length > 0) {
    parentId = existingParent[0].id;
  } else {
    if (!body?.parentPassword || String(body.parentPassword).length < 8) {
      return jsonError("Parent password must be at least 8 characters");
    }
    const rows = (await sql()`
      INSERT INTO users (email, password_hash, role, email_verified_at, last_active_at)
      VALUES (${invite.parent_email}, ${hashPassword(body.parentPassword)}, 'parent', now(), now())
      RETURNING id
    `) as { id: string }[];
    parentId = rows[0].id;
  }

  const childId = await createCoachedUser({
    email: child.email,
    password: child.password,
    parentId,
    displayName: child.displayName,
    dateOfBirth: child.dateOfBirth,
    gender: child.gender ?? null,
    heightCm: child.heightCm ?? null,
    weightKg: child.weightKg ?? null,
    goal: child.goal ?? null,
    timezone: child.timezone ?? "UTC",
  });

  await sql()`
    UPDATE parent_invites
    SET status = 'completed', completed_at = now(),
        parent_user_id = ${parentId}, child_user_id = ${childId}
    WHERE id = ${invite.id}
  `;

  const session = await createSession(parentId, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);
  await trackEvent(request, "parent_setup_completed", parentId);

  return NextResponse.json({ ok: true, childId, token: session.token }, { status: 201 });
}
