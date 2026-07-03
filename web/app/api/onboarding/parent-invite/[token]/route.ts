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

/** Neon returns `date` columns as Date objects; normalize to YYYY-MM-DD. */
function toDateString(value: string | Date | null): string | null {
  if (!value) return null;
  return new Date(value).toISOString().slice(0, 10);
}

async function findInvite(token: string) {
  const rows = (await sql()`
    SELECT id, parent_email, child_name, child_dob, status, expires_at
    FROM parent_invites
    WHERE token_hash = ${hashToken(token)}
  `) as {
    id: string;
    parent_email: string;
    child_name: string | null;
    child_dob: string | null;
    status: string;
    expires_at: string;
  }[];
  const invite = rows[0];
  if (!invite || invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
    return null;
  }
  return { ...invite, child_dob: toDateString(invite.child_dob) };
}

/** Validates a parent setup link and returns the child's stored identity. */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite) return jsonError("This setup link is invalid or has expired", 404);
  return NextResponse.json({
    valid: true,
    parentEmail: invite.parent_email,
    childName: invite.child_name,
    childDob: invite.child_dob ? invite.child_dob.slice(0, 10) : null,
  });
}

/**
 * Parent completes setup: enters their own name and birthday, sets their
 * password (new accounts), and sets the child's login credentials. The
 * child's name and DOB come from the invite (entered by the child) and can
 * be corrected here.
 * Body: { parent: { name, dateOfBirth, password? },
 *         child: { email, password, displayName?, dateOfBirth?, gender?,
 *                  heightCm?, weightKg?, goal?, timezone? } }
 */
export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params;
  const invite = await findInvite(token);
  if (!invite) return jsonError("This setup link is invalid or has expired", 404);

  const body = await request.json().catch(() => null);
  const parent = body?.parent;
  const child = body?.child;

  // Parent identity is required for all setups (name + birthday).
  const parentName = typeof parent?.name === "string" ? parent.name.trim() : "";
  if (!parentName) return jsonError("Your name is required");
  if (!parent?.dateOfBirth || isNaN(Date.parse(parent.dateOfBirth))) {
    return jsonError("Your date of birth is required");
  }
  if (ageFromDob(parent.dateOfBirth) < 16) {
    return jsonError("A parent or guardian must be an adult");
  }

  // Child identity defaults to what the child entered at onboarding.
  const childName =
    (typeof child?.displayName === "string" && child.displayName.trim()) ||
    invite.child_name;
  const childDob = child?.dateOfBirth || invite.child_dob?.slice(0, 10);
  if (!child?.email || !child?.password || !childName || !childDob) {
    return jsonError("Child email, password, name, and date of birth are required");
  }
  if (isNaN(Date.parse(childDob))) return jsonError("Invalid child date of birth");
  const age = ageFromDob(childDob);
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
    // Keep the parent's identity current; upgrade individual users to parents.
    await sql()`
      UPDATE users SET
        name = COALESCE(name, ${parentName.slice(0, 60)}),
        date_of_birth = COALESCE(date_of_birth, ${parent.dateOfBirth}),
        role = CASE WHEN role = 'user' THEN 'parent' ELSE role END
      WHERE id = ${parentId}
    `;
  } else {
    if (!parent?.password || String(parent.password).length < 8) {
      return jsonError("Parent password must be at least 8 characters");
    }
    const rows = (await sql()`
      INSERT INTO users (email, name, password_hash, role, date_of_birth,
                         email_verified_at, last_active_at)
      VALUES (${invite.parent_email}, ${parentName.slice(0, 60)},
              ${hashPassword(parent.password)}, 'parent', ${parent.dateOfBirth},
              now(), now())
      RETURNING id
    `) as { id: string }[];
    parentId = rows[0].id;
  }

  const childId = await createCoachedUser({
    email: child.email,
    password: child.password,
    parentId,
    displayName: String(childName).slice(0, 60),
    dateOfBirth: childDob,
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
