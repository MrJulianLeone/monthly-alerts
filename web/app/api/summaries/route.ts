import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";

/** My monthly summaries, newest first (in-app view of the core deliverable). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const summaries = (await sql()`
    SELECT id, month, stats, narrative, email_sent_at, created_at
    FROM monthly_summaries
    WHERE user_id = ${auth.user.id}
    ORDER BY month DESC LIMIT 24
  `) as Record<string, unknown>[];

  return NextResponse.json({ summaries });
}
