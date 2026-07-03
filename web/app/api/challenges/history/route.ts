import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";

/** Completed challenge history (History tab / dashboards). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10) || 30, 100);

  const history = (await sql()`
    SELECT c.id, c.sequence_number, c.target_value, c.completed_at,
           e.name, e.unit, e.equipment,
           cl.completed_value, cl.perceived_difficulty
    FROM challenges c
    JOIN exercises e ON e.id = c.exercise_id
    LEFT JOIN challenge_logs cl ON cl.challenge_id = c.id
    WHERE c.user_id = ${auth.user.id} AND c.status = 'completed'
    ORDER BY c.completed_at DESC LIMIT ${limit}
  `) as Record<string, unknown>[];

  return NextResponse.json({ history });
}
