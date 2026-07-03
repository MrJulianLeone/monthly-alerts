import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";

const MAX_LEADERBOARDS_PER_USER = 3;
const LEADERBOARD_GOAL = 5; // build your leaderboard to 5 friends

/** My leaderboards with member counts and progress toward the 5-friend goal. */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const leaderboards = (await sql()`
    SELECT l.id, l.name, l.owner_id, l.created_at,
           (SELECT count(*)::int FROM leaderboard_members m2
            WHERE m2.leaderboard_id = l.id AND m2.left_at IS NULL) AS member_count
    FROM leaderboards l
    JOIN leaderboard_members m ON m.leaderboard_id = l.id
    WHERE m.user_id = ${auth.user.id} AND m.left_at IS NULL
    ORDER BY l.created_at
  `) as Record<string, unknown>[];

  return NextResponse.json({ leaderboards, goal: LEADERBOARD_GOAL });
}

/** Create a leaderboard (owner auto-joins; max 3 leaderboards per user). */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const name =
    typeof body.name === "string" && body.name.trim().length > 0
      ? body.name.trim().slice(0, 60)
      : "My Leaderboard";

  const count = (await sql()`
    SELECT count(*)::int AS n FROM leaderboard_members
    WHERE user_id = ${auth.user.id} AND left_at IS NULL
  `) as { n: number }[];
  if (count[0].n >= MAX_LEADERBOARDS_PER_USER) {
    return jsonError(`You can be in at most ${MAX_LEADERBOARDS_PER_USER} leaderboards`, 409);
  }

  const rows = (await sql()`
    INSERT INTO leaderboards (owner_id, name) VALUES (${auth.user.id}, ${name})
    RETURNING id, name, created_at
  `) as { id: string; name: string; created_at: string }[];

  await sql()`
    INSERT INTO leaderboard_members (leaderboard_id, user_id)
    VALUES (${rows[0].id}, ${auth.user.id})
  `;

  return NextResponse.json({ leaderboard: rows[0] }, { status: 201 });
}
