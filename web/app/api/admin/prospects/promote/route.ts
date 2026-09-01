import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { promoteCandidates } from "@/lib/roster";

export const maxDuration = 120;

/** Moves staged roster candidates into the prospect pipeline. Admin-only. */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const source = typeof body?.source === "string" && body.source !== "" ? body.source : null;
  const limit = Number.isFinite(Number(body?.limit)) ? Number(body.limit) : 50;
  const result = await promoteCandidates(source, limit);
  return NextResponse.json(result);
}
