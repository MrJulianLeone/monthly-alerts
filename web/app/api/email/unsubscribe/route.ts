import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { unsubscribeSignature } from "@/lib/auth";
import { sql } from "@/lib/db";
import { jsonError } from "@/lib/api";

/** Signed opt-out from monthly emails; no session required. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const userId = typeof body.u === "string" ? body.u : "";
  const sig = typeof body.s === "string" ? body.s : "";
  if (!userId || !sig) return jsonError("Bad request", 400);

  const expected = unsubscribeSignature(userId);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return jsonError("Invalid signature", 403);
  }

  await sql()`UPDATE users SET email_opt_out = true WHERE id = ${userId}`;
  return NextResponse.json({ ok: true });
}
