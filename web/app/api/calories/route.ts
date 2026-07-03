import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";
import { ageFromDob } from "@/lib/auth";
import { getTodayCalories, resolveDailyCalorieGoal } from "@/lib/calories";

/**
 * The user's running calorie standing for today plus a short recent history of
 * their per-day calorie log. Backs any UI that shows "remaining calories today".
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const days = Math.min(parseInt(url.searchParams.get("days") ?? "14", 10) || 14, 90);

  const profileRows = (await sql()`
    SELECT goal, gender, height_cm, weight_kg, daily_calorie_goal
    FROM profiles WHERE user_id = ${auth.user.id}
  `) as {
    goal: string | null;
    gender: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    daily_calorie_goal: number | null;
  }[];
  const profile = profileRows[0] ?? null;
  const age = auth.user.date_of_birth ? ageFromDob(auth.user.date_of_birth) : 25;

  const goal = resolveDailyCalorieGoal(profile?.daily_calorie_goal, {
    age,
    gender: profile?.gender ?? null,
    heightCm: profile?.height_cm != null ? Number(profile.height_cm) : null,
    weightKg: profile?.weight_kg != null ? Number(profile.weight_kg) : null,
    goal: profile?.goal ?? null,
  });

  const [today, history] = await Promise.all([
    getTodayCalories(auth.user.id, goal),
    sql()`
      SELECT log_date, calories_consumed, meals_logged, calorie_goal
      FROM daily_calorie_logs
      WHERE user_id = ${auth.user.id}
      ORDER BY log_date DESC LIMIT ${days}
    `,
  ]);

  return NextResponse.json({
    daily_calorie_goal: goal,
    is_auto_estimated: profile?.daily_calorie_goal == null,
    today,
    history,
  });
}
