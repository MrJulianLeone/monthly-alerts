import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { createSession, setSessionCookie, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) return jsonError("Email and password are required");

  const rows = (await sql()`
    SELECT id, password_hash, role FROM users
    WHERE email = ${body.email} AND deleted_at IS NULL
  `) as { id: string; password_hash: string | null; role: string }[];

  const user = rows[0];
  if (!user?.password_hash || !verifyPassword(body.password, user.password_hash)) {
    return jsonError("Invalid email or password", 401);
  }

  const session = await createSession(user.id, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);
  await trackEvent(request, "login", user.id);

  return NextResponse.json({ token: session.token, userId: user.id, role: user.role });
}
