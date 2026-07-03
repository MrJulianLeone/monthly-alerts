import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRole, jsonError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

async function assertChild(parentId: string, childId: string): Promise<boolean> {
  const rows = (await sql()`
    SELECT 1 FROM users WHERE id = ${childId} AND parent_id = ${parentId} AND deleted_at IS NULL
  `) as unknown[];
  return rows.length > 0;
}

/** Child detail: profile, recent meals, challenge history, summaries. */
export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireRole(request, "parent");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  if (!(await assertChild(auth.user.id, id))) return jsonError("Child not found", 404);

  const [profile, meals, challenges, summaries, weights, progress] = await Promise.all([
    sql()`
      SELECT u.email, u.date_of_birth, u.last_active_at,
             p.display_name, p.gender, p.goal, p.weight_kg, p.height_cm, p.timezone,
             st.current_streak, st.longest_streak
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN streaks st ON st.user_id = u.id
      WHERE u.id = ${id}`,
    sql()`
      SELECT id, meal_type, ai_feedback, ai_analysis, logged_at
      FROM meal_logs WHERE user_id = ${id}
      ORDER BY logged_at DESC LIMIT 20`,
    sql()`
      SELECT c.sequence_number, c.target_value, c.completed_at, e.name, e.unit,
             cl.completed_value
      FROM challenges c
      JOIN exercises e ON e.id = c.exercise_id
      LEFT JOIN challenge_logs cl ON cl.challenge_id = c.id
      WHERE c.user_id = ${id} AND c.status = 'completed'
      ORDER BY c.completed_at DESC LIMIT 20`,
    sql()`
      SELECT id, month, stats, narrative, email_sent_at
      FROM monthly_summaries WHERE user_id = ${id}
      ORDER BY month DESC LIMIT 12`,
    sql()`
      SELECT weight_kg, recorded_at FROM weight_entries
      WHERE user_id = ${id} ORDER BY recorded_at DESC LIMIT 24`,
    sql()`
      SELECT total_meals_logged, meal_days, balanced_meals, balance_breakdown,
             total_challenges_completed, total_challenge_volume,
             first_activity_at, last_activity_at
      FROM progress_stats WHERE user_id = ${id}`,
  ]);

  return NextResponse.json({
    profile: (profile as Record<string, unknown>[])[0] ?? null,
    meals,
    challenges,
    summaries,
    weights,
    progress: (progress as Record<string, unknown>[])[0] ?? null,
  });
}

/** Parent updates the child's profile and goals. */
export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireRole(request, "parent");
  if ("response" in auth) return auth.response;
  const { id } = await params;
  if (!(await assertChild(auth.user.id, id))) return jsonError("Child not found", 404);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid request body");

  const goal = ["lose_weight", "build_strength", "get_fit", "build_habits"].includes(body.goal)
    ? body.goal
    : undefined;
  const weightKg =
    typeof body.weightKg === "number" && body.weightKg > 20 && body.weightKg < 400
      ? body.weightKg
      : undefined;
  const heightCm =
    typeof body.heightCm === "number" && body.heightCm > 80 && body.heightCm < 260
      ? body.heightCm
      : undefined;
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim().slice(0, 60)
      : undefined;

  await sql()`
    UPDATE profiles SET
      goal = COALESCE(${goal ?? null}, goal),
      weight_kg = COALESCE(${weightKg ?? null}, weight_kg),
      height_cm = COALESCE(${heightCm ?? null}, height_cm),
      display_name = COALESCE(${displayName ?? null}, display_name)
    WHERE user_id = ${id}
  `;
  if (weightKg !== undefined) {
    await sql()`INSERT INTO weight_entries (user_id, weight_kg) VALUES (${id}, ${weightKg})`;
  }

  return NextResponse.json({ ok: true });
}
