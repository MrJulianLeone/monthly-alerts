import { sql } from "@/lib/db";
import type { MealAnalysis } from "@/lib/ai";

/**
 * Running, cumulative progress tracking.
 *
 * Instead of scanning (or retaining) every meal, image, or challenge log, we
 * keep a single always-current `progress_stats` row per user and update it in
 * O(1) as events happen. This is storage-minimal (one small row per user) yet
 * accurate and cumulative — the "running summary" of diet + fitness progress.
 */

export type ProgressStats = {
  total_meals_logged: number;
  meal_days: number;
  balanced_meals: number;
  balance_breakdown: Record<string, number>;
  last_meal_date: string | null;
  total_challenges_completed: number;
  total_challenge_volume: number;
  first_activity_at: string | null;
  last_activity_at: string | null;
};

const EMPTY_PROGRESS: ProgressStats = {
  total_meals_logged: 0,
  meal_days: 0,
  balanced_meals: 0,
  balance_breakdown: {},
  last_meal_date: null,
  total_challenges_completed: 0,
  total_challenge_volume: 0,
  first_activity_at: null,
  last_activity_at: null,
};

/**
 * Records a logged meal against the running diet summary. `meal_days` counts
 * distinct calendar days (in the user's timezone) so it doesn't inflate when
 * several meals are logged the same day.
 */
export async function recordMealProgress(
  userId: string,
  balance: MealAnalysis["balance"]
): Promise<void> {
  const balanced = balance === "balanced" ? 1 : 0;
  await sql()`
    WITH tz AS (
      SELECT COALESCE(p.timezone, 'UTC') AS timezone
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
    ),
    today AS (
      SELECT (now() AT TIME ZONE (SELECT timezone FROM tz))::date AS d
    )
    INSERT INTO progress_stats AS ps (
      user_id, total_meals_logged, meal_days, balanced_meals,
      balance_breakdown, last_meal_date, first_activity_at, last_activity_at
    )
    VALUES (
      ${userId}, 1, 1, ${balanced},
      jsonb_build_object(${balance}::text, 1), (SELECT d FROM today), now(), now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      total_meals_logged = ps.total_meals_logged + 1,
      meal_days = ps.meal_days + CASE
        WHEN ps.last_meal_date IS DISTINCT FROM (SELECT d FROM today) THEN 1 ELSE 0 END,
      balanced_meals = ps.balanced_meals + ${balanced},
      balance_breakdown = jsonb_set(
        ps.balance_breakdown,
        ARRAY[${balance}::text],
        to_jsonb(COALESCE((ps.balance_breakdown ->> ${balance}::text)::int, 0) + 1),
        true
      ),
      last_meal_date = (SELECT d FROM today),
      first_activity_at = COALESCE(ps.first_activity_at, now()),
      last_activity_at = now()
  `;
}

/** Records a completed challenge against the running fitness summary. */
export async function recordChallengeProgress(
  userId: string,
  completedValue: number
): Promise<void> {
  const volume = Number.isFinite(completedValue) ? Math.max(0, Math.round(completedValue)) : 0;
  await sql()`
    INSERT INTO progress_stats AS ps (
      user_id, total_challenges_completed, total_challenge_volume,
      first_activity_at, last_activity_at
    )
    VALUES (${userId}, 1, ${volume}, now(), now())
    ON CONFLICT (user_id) DO UPDATE SET
      total_challenges_completed = ps.total_challenges_completed + 1,
      total_challenge_volume = ps.total_challenge_volume + ${volume},
      first_activity_at = COALESCE(ps.first_activity_at, now()),
      last_activity_at = now()
  `;
}

/** Returns the running progress summary for a user (zeroed if none yet). */
export async function getProgress(userId: string): Promise<ProgressStats> {
  const rows = (await sql()`
    SELECT total_meals_logged, meal_days, balanced_meals, balance_breakdown,
           last_meal_date, total_challenges_completed, total_challenge_volume,
           first_activity_at, last_activity_at
    FROM progress_stats WHERE user_id = ${userId}
  `) as Record<string, unknown>[];
  if (rows.length === 0) return { ...EMPTY_PROGRESS };
  const r = rows[0];
  return {
    total_meals_logged: Number(r.total_meals_logged ?? 0),
    meal_days: Number(r.meal_days ?? 0),
    balanced_meals: Number(r.balanced_meals ?? 0),
    balance_breakdown: (r.balance_breakdown as Record<string, number>) ?? {},
    last_meal_date: (r.last_meal_date as string | null) ?? null,
    total_challenges_completed: Number(r.total_challenges_completed ?? 0),
    total_challenge_volume: Number(r.total_challenge_volume ?? 0),
    first_activity_at: (r.first_activity_at as string | null) ?? null,
    last_activity_at: (r.last_activity_at as string | null) ?? null,
  };
}
