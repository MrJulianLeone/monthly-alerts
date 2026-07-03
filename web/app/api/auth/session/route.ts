import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { effectiveRole } from "@/lib/admin";
import { requireUser } from "@/lib/api";
import { ageFromDob } from "@/lib/auth";
import { getTodayCalories, resolveDailyCalorieGoal } from "@/lib/calories";

/** Current user + profile + subscription snapshot (used by mobile at launch). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const rows = (await sql()`
    SELECT u.id, u.email, u.role, u.date_of_birth,
           p.display_name, p.gender, p.height_cm, p.weight_kg, p.goal,
           p.daily_calorie_goal, p.timezone,
           s.status AS subscription_status, s.trial_ends_at,
           st.current_streak, st.longest_streak
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    WHERE u.id = ${auth.user.id}
  `) as Record<string, unknown>[];

  const user = rows[0] ?? null;
  if (user) {
    user.role = effectiveRole(String(user.email), String(user.role));

    // Attach the effective daily calorie goal + today's running standing.
    const age = user.date_of_birth ? ageFromDob(user.date_of_birth as string) : 25;
    const goal = resolveDailyCalorieGoal(
      user.daily_calorie_goal != null ? Number(user.daily_calorie_goal) : null,
      {
        age,
        gender: (user.gender as string | null) ?? null,
        heightCm: user.height_cm != null ? Number(user.height_cm) : null,
        weightKg: user.weight_kg != null ? Number(user.weight_kg) : null,
        goal: (user.goal as string | null) ?? null,
      }
    );
    user.effective_daily_calorie_goal = goal;
    user.today_calories = await getTodayCalories(String(user.id), goal);
  }
  return NextResponse.json({ user });
}
