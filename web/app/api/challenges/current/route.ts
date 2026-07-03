import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { unlockNextChallenge } from "@/lib/progression";

/** The user's current active challenge (creates one if missing). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const rows = (await sql()`
    SELECT c.id, c.sequence_number, c.target_value, c.unlocked_at,
           e.name, e.slug, e.equipment, e.unit, e.description
    FROM challenges c
    JOIN exercises e ON e.id = c.exercise_id
    WHERE c.user_id = ${auth.user.id} AND c.status = 'active'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as Record<string, unknown>[];

  if (rows.length > 0) return NextResponse.json({ challenge: rows[0] });

  const unlocked = await unlockNextChallenge(auth.user.id);
  if (!unlocked) return NextResponse.json({ challenge: null });

  return NextResponse.json({
    challenge: {
      id: unlocked.id,
      sequence_number: unlocked.sequence,
      target_value: unlocked.target,
      name: unlocked.exercise.name,
      slug: unlocked.exercise.slug,
      equipment: unlocked.exercise.equipment,
      unit: unlocked.exercise.unit,
    },
  });
}
