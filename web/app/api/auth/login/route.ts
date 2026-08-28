import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { findUserByEmail, startSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) return jsonError("invalid_credentials", 401);

  const user = await findUserByEmail(email);
  if (!user) return jsonError("invalid_credentials", 401);
  if (!user.password_hash) {
    // Magic-link-era account: email is verified but no password was ever set.
    return jsonError("no_password", 409);
  }
  if (!verifyPassword(password, user.password_hash)) {
    return jsonError("invalid_credentials", 401);
  }
  if (!user.email_verified_at) {
    return jsonError("unverified", 403);
  }

  await startSession(user.id, request.headers.get("user-agent"));
  return NextResponse.json({ onboarded: !!user.onboarded_at });
}
