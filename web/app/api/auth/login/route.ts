import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { effectiveRole } from "@/lib/admin";
import { createSession, setSessionCookie, setUserCookie, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) return jsonError("Email and password are required");

  const rows = (await sql()`
    SELECT u.id, u.password_hash, u.role, p.display_name
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.email = ${body.email} AND u.deleted_at IS NULL
  `) as { id: string; password_hash: string | null; role: string; display_name: string | null }[];

  const user = rows[0];
  if (!user?.password_hash || !verifyPassword(body.password, user.password_hash)) {
    return jsonError("Invalid email or password", 401);
  }

  const role = effectiveRole(body.email, user.role);
  const session = await createSession(user.id, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);
  await setUserCookie(user.display_name ?? body.email, role);
  await trackEvent(request, "login", user.id);

  return NextResponse.json({ token: session.token, userId: user.id, role });
}
