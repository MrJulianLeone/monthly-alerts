import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";

/** Registers an Expo push token for the signed-in user. */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const token = body?.token;
  const platform = body?.platform;
  if (!token || typeof token !== "string") return jsonError("token is required");
  if (!["ios", "android"].includes(platform)) return jsonError("platform must be ios or android");

  await sql()`
    INSERT INTO push_tokens (user_id, expo_push_token, platform)
    VALUES (${auth.user.id}, ${token}, ${platform})
    ON CONFLICT (expo_push_token) DO UPDATE
      SET user_id = ${auth.user.id}, last_used_at = now()
  `;

  return NextResponse.json({ ok: true });
}
