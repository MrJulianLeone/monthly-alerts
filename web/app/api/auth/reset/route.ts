import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  consumeEmailToken,
  hashPassword,
  MIN_PASSWORD_LENGTH,
  startSession,
} from "@/lib/auth";
import { sql } from "@/lib/db";

/**
 * Completes a password reset. Using the emailed token also proves control of
 * the address, so it verifies the email and signs the user straight in.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body.token === "string" ? body.token : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length < MIN_PASSWORD_LENGTH) return jsonError("password_too_short", 400);
  const consumed = token ? await consumeEmailToken(token, "reset") : null;
  if (!consumed) return jsonError("invalid_token", 400);

  const rows = (await sql()`
    UPDATE users
    SET password_hash = ${hashPassword(password)},
        email_verified_at = COALESCE(email_verified_at, now())
    WHERE email = ${consumed.email} AND deleted_at IS NULL
    RETURNING id, onboarded_at
  `) as { id: string; onboarded_at: string | null }[];
  if (rows.length === 0) return jsonError("invalid_token", 400);

  await startSession(rows[0].id, request.headers.get("user-agent"));
  return NextResponse.json({ onboarded: !!rows[0].onboarded_at });
}
