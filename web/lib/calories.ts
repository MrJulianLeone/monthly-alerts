import { sql } from "@/lib/db";

/**
 * Daily calorie tracking.
 *
 * Each user has a personal daily calorie goal (either set explicitly on their
 * profile or auto-estimated from their profile) and a running per-day log. After
 * every meal we add the meal's estimated calories to the running total for the
 * current calendar day (in the user's timezone) and report how many calories
 * remain for the day.
 */

export type DailyCalories = {
  log_date: string;
  calories_consumed: number;
  meals_logged: number;
  calorie_goal: number;
  remaining: number;
};

export type CalorieGoalInputs = {
  age: number;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
};

/**
 * Estimates a sensible daily calorie target from a user's profile using the
 * Mifflin-St Jeor BMR equation, a light activity factor, and a goal-based
 * adjustment. Used when the user has not set an explicit `daily_calorie_goal`.
 */
export function defaultDailyCalorieGoal(input: CalorieGoalInputs): number {
  const age = input.age > 0 ? input.age : 25;
  const weight = input.weightKg && input.weightKg > 0 ? input.weightKg : 65;
  const height = input.heightCm && input.heightCm > 0 ? input.heightCm : 168;
  // Sex term: +5 (male), -161 (female), split the difference otherwise.
  const sexTerm = input.gender === "male" ? 5 : input.gender === "female" ? -161 : -78;

  const bmr = 10 * weight + 6.25 * height - 5 * age + sexTerm;
  const tdee = bmr * 1.4; // lightly active

  let target = tdee;
  switch (input.goal) {
    case "lose_weight":
      target = tdee - 500;
      break;
    case "build_strength":
      target = tdee + 250;
      break;
    default:
      target = tdee;
  }

  // Keep within safe, sensible bounds and round to the nearest 10 kcal.
  const bounded = Math.min(4000, Math.max(1200, target));
  return Math.round(bounded / 10) * 10;
}

/**
 * Resolves a user's effective daily calorie goal: the explicit profile value if
 * set, otherwise the auto-estimate from their profile.
 */
export function resolveDailyCalorieGoal(
  explicitGoal: number | null | undefined,
  inputs: CalorieGoalInputs
): number {
  if (typeof explicitGoal === "number" && explicitGoal > 0) return Math.round(explicitGoal);
  return defaultDailyCalorieGoal(inputs);
}

/**
 * Adds a meal's calories to the user's running daily log (keyed by calendar day
 * in the user's timezone) and returns the updated running totals, including how
 * many calories remain against their goal for the day.
 */
export async function recordDailyCalories(
  userId: string,
  calories: number,
  goal: number
): Promise<DailyCalories> {
  const cals = Number.isFinite(calories) ? Math.max(0, Math.round(calories)) : 0;
  const dailyGoal = Number.isFinite(goal) && goal > 0 ? Math.round(goal) : 2000;

  const rows = (await sql()`
    WITH tz AS (
      SELECT COALESCE(p.timezone, 'UTC') AS timezone
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
    ),
    today AS (
      SELECT (now() AT TIME ZONE (SELECT timezone FROM tz))::date AS d
    )
    INSERT INTO daily_calorie_logs AS d (
      user_id, log_date, calories_consumed, meals_logged, calorie_goal
    )
    VALUES (${userId}, (SELECT d FROM today), ${cals}, 1, ${dailyGoal})
    ON CONFLICT (user_id, log_date) DO UPDATE SET
      calories_consumed = d.calories_consumed + ${cals},
      meals_logged = d.meals_logged + 1,
      calorie_goal = ${dailyGoal}
    RETURNING log_date, calories_consumed, meals_logged, calorie_goal
  `) as {
    log_date: string;
    calories_consumed: number;
    meals_logged: number;
    calorie_goal: number;
  }[];

  const r = rows[0];
  const consumed = Number(r.calories_consumed ?? cals);
  const resolvedGoal = Number(r.calorie_goal ?? dailyGoal);
  return {
    log_date: String(r.log_date),
    calories_consumed: consumed,
    meals_logged: Number(r.meals_logged ?? 1),
    calorie_goal: resolvedGoal,
    remaining: resolvedGoal - consumed,
  };
}

/** Returns the user's running calorie log for today (zeroed if nothing yet). */
export async function getTodayCalories(
  userId: string,
  fallbackGoal: number
): Promise<DailyCalories> {
  const goal = Number.isFinite(fallbackGoal) && fallbackGoal > 0 ? Math.round(fallbackGoal) : 2000;
  const rows = (await sql()`
    WITH tz AS (
      SELECT COALESCE(p.timezone, 'UTC') AS timezone
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
    ),
    today AS (
      SELECT (now() AT TIME ZONE (SELECT timezone FROM tz))::date AS d
    )
    SELECT log_date, calories_consumed, meals_logged, calorie_goal
    FROM daily_calorie_logs
    WHERE user_id = ${userId} AND log_date = (SELECT d FROM today)
  `) as {
    log_date: string;
    calories_consumed: number;
    meals_logged: number;
    calorie_goal: number | null;
  }[];

  if (rows.length === 0) {
    return {
      log_date: "",
      calories_consumed: 0,
      meals_logged: 0,
      calorie_goal: goal,
      remaining: goal,
    };
  }

  const r = rows[0];
  const consumed = Number(r.calories_consumed ?? 0);
  const resolvedGoal = Number(r.calorie_goal ?? goal);
  return {
    log_date: String(r.log_date),
    calories_consumed: consumed,
    meals_logged: Number(r.meals_logged ?? 0),
    calorie_goal: resolvedGoal,
    remaining: resolvedGoal - consumed,
  };
}

/**
 * Builds the coach's remaining-calories chat message after a meal is logged.
 * Handles the "over budget" case gracefully and stays constructive.
 */
export function remainingCaloriesMessage(daily: DailyCalories, mealCalories: number | null): string {
  const goal = daily.calorie_goal;
  const consumed = daily.calories_consumed;
  const remaining = daily.remaining;

  if (mealCalories === null) {
    // Couldn't estimate this meal's calories; still surface the day's standing.
    if (remaining >= 0) {
      return `I couldn't estimate the calories for this one. So far today you've logged about ${consumed} kcal, leaving roughly ${remaining} of your ${goal} kcal goal.`;
    }
    return `I couldn't estimate the calories for this one. So far today you've logged about ${consumed} kcal, which is about ${Math.abs(
      remaining
    )} over your ${goal} kcal goal.`;
  }

  if (remaining >= 0) {
    return `That's about ${mealCalories} kcal. You've had ${consumed} of your ${goal} kcal today — about ${remaining} kcal remaining. Plan the rest of your day around that.`;
  }

  return `That's about ${mealCalories} kcal, bringing you to ${consumed} of your ${goal} kcal goal — around ${Math.abs(
    remaining
  )} kcal over for today. Consider lighter, protein-forward choices to finish the day.`;
}
