import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";

/** Update my profile (goal, weight, height, display name, timezone). */
export async function PATCH(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid request body");

  const goal = ["lose_weight", "build_strength", "get_fit", "build_habits"].includes(body.goal)
    ? body.goal
    : undefined;
  const gender = ["male", "female", "other"].includes(body.gender) ? body.gender : undefined;
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
  const timezone = typeof body.timezone === "string" ? body.timezone : undefined;
  // Allow clearing the goal back to auto-estimate by passing null explicitly.
  const dailyCalorieGoalProvided =
    body.dailyCalorieGoal === null ||
    (typeof body.dailyCalorieGoal === "number" &&
      body.dailyCalorieGoal >= 800 &&
      body.dailyCalorieGoal <= 6000);
  const dailyCalorieGoal =
    typeof body.dailyCalorieGoal === "number" ? Math.round(body.dailyCalorieGoal) : null;

  await sql()`
    UPDATE profiles SET
      goal = COALESCE(${goal ?? null}, goal),
      gender = COALESCE(${gender ?? null}, gender),
      weight_kg = COALESCE(${weightKg ?? null}, weight_kg),
      height_cm = COALESCE(${heightCm ?? null}, height_cm),
      display_name = COALESCE(${displayName ?? null}, display_name),
      timezone = COALESCE(${timezone ?? null}, timezone),
      daily_calorie_goal = CASE WHEN ${dailyCalorieGoalProvided}
        THEN ${dailyCalorieGoal} ELSE daily_calorie_goal END
    WHERE user_id = ${auth.user.id}
  `;

  // Weight updates also append to the history used by monthly summaries.
  if (weightKg !== undefined) {
    await sql()`
      INSERT INTO weight_entries (user_id, weight_kg) VALUES (${auth.user.id}, ${weightKg})
    `;
  }

  const rows = (await sql()`
    SELECT display_name, gender, height_cm, weight_kg, goal, daily_calorie_goal, timezone
    FROM profiles WHERE user_id = ${auth.user.id}
  `) as Record<string, unknown>[];

  return NextResponse.json({ profile: rows[0] });
}
