import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";

const ACTIVE_DAYS = 14; // show active friends only (last 7–14 days)

type Params = { params: Promise<{ id: string }> };

/**
 * Leaderboard standings: active members (last 14 days) ranked by this week's
 * activity (challenges completed + meals logged in the last 7 days).
 */
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const membership = (await sql()`
    SELECT 1 FROM leaderboard_members
    WHERE leaderboard_id = ${id} AND user_id = ${auth.user.id} AND left_at IS NULL
  `) as unknown[];
  if (membership.length === 0) return jsonError("Not a member of this leaderboard", 403);

  const rows = (await sql()`
    SELECT l.id, l.name, l.owner_id,
           u.id AS user_id, p.display_name,
           st.current_streak,
           (SELECT count(*)::int FROM challenge_logs cl
            WHERE cl.user_id = u.id AND cl.completed_at > now() - interval '7 days') AS challenges_week,
           (SELECT count(*)::int FROM meal_logs ml
            WHERE ml.user_id = u.id AND ml.logged_at > now() - interval '7 days') AS meals_week
    FROM leaderboards l
    JOIN leaderboard_members m ON m.leaderboard_id = l.id AND m.left_at IS NULL
    JOIN users u ON u.id = m.user_id AND u.deleted_at IS NULL
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    WHERE l.id = ${id}
      AND u.last_active_at > now() - make_interval(days => ${ACTIVE_DAYS})
  `) as {
    id: string;
    name: string;
    owner_id: string;
    user_id: string;
    display_name: string | null;
    current_streak: number | null;
    challenges_week: number;
    meals_week: number;
  }[];

  if (rows.length === 0) {
    // Leaderboard exists but has no active members (or the viewer is inactive).
    const lb = (await sql()`
      SELECT id, name, owner_id FROM leaderboards WHERE id = ${id}
    `) as { id: string; name: string; owner_id: string }[];
    if (lb.length === 0) return jsonError("Leaderboard not found", 404);
    return NextResponse.json({ leaderboard: lb[0], standings: [] });
  }

  const standings = rows
    .map((r) => ({
      userId: r.user_id,
      displayName: r.display_name ?? "Member",
      streak: r.current_streak ?? 0,
      challengesThisWeek: r.challenges_week,
      mealsThisWeek: r.meals_week,
      score: r.challenges_week * 10 + r.meals_week * 5 + (r.current_streak ?? 0) * 2,
      isYou: r.user_id === auth.user.id,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({ rank: i + 1, ...entry }));

  return NextResponse.json({
    leaderboard: { id: rows[0].id, name: rows[0].name, owner_id: rows[0].owner_id },
    standings,
  });
}
