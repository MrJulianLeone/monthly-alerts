import { sql } from "@/lib/db";
import { ageFromDob } from "@/lib/auth";

/**
 * Progressive-overload engine.
 *
 * Starting targets are derived from the exercise base value scaled by age
 * (from DOB) and gender. Increases depend on last performance and perceived
 * difficulty, and consistent meal-logging streaks accelerate progression.
 */

type Exercise = {
  id: string;
  slug: string;
  name: string;
  equipment: string;
  unit: string;
  base_value: number;
  min_age: number;
};

const UPPER_BODY = new Set(["pushups", "db-curls", "db-shoulder-press", "db-rows"]);

function ageFactor(age: number): number {
  if (age < 13) return 0.7;
  if (age < 16) return 0.85;
  if (age < 40) return 1.0;
  if (age < 50) return 0.9;
  return 0.8;
}

function genderFactor(gender: string | null, exercise: Exercise): number {
  // Gender-aware starting points: slightly lower upper-body starting targets
  // for female users; lower body and core start equal.
  if (gender === "female" && UPPER_BODY.has(exercise.slug)) return 0.8;
  return 1.0;
}

export function startingTarget(
  exercise: Exercise,
  profile: { dob: string; gender: string | null }
): number {
  const age = ageFromDob(profile.dob);
  const value = Math.round(
    exercise.base_value * ageFactor(age) * genderFactor(profile.gender, exercise)
  );
  return Math.max(value, exercise.unit === "seconds" ? 10 : 3);
}

export function nextTarget(
  exercise: Exercise,
  profile: { dob: string; gender: string | null },
  last: { target: number; completedValue: number; difficulty: string | null },
  mealStreak: number
): number {
  // Base increase from perceived difficulty and actual performance.
  let pct: number;
  if (last.difficulty === "easy" || last.completedValue > last.target) pct = 0.12;
  else if (last.difficulty === "hard" || last.completedValue < last.target) pct = 0.02;
  else pct = 0.06;

  // Consistent meal logging accelerates progression (up to +50% of the bump).
  if (mealStreak >= 7) pct *= 1.5;
  else if (mealStreak >= 3) pct *= 1.25;

  // Younger users progress a bit more conservatively.
  if (ageFromDob(profile.dob) < 16) pct *= 0.8;

  const base = Math.max(last.completedValue, last.target);
  return Math.max(base + Math.max(1, Math.round(base * pct)), 1);
}

/** Picks the next exercise, rotating the catalog and respecting min_age. */
export async function pickNextExercise(
  userId: string,
  dob: string
): Promise<Exercise | null> {
  const age = ageFromDob(dob);
  const rows = (await sql()`
    WITH last_ex AS (
      SELECT exercise_id FROM challenges
      WHERE user_id = ${userId}
      ORDER BY sequence_number DESC LIMIT 1
    ),
    eligible AS (
      SELECT e.*, row_number() OVER (ORDER BY e.slug) AS rn
      FROM exercises e
      WHERE e.is_active AND e.min_age <= ${age}
    )
    SELECT id, slug, name, equipment, unit, base_value, min_age FROM eligible
    ORDER BY CASE
      WHEN rn > COALESCE((SELECT rn FROM eligible WHERE id = (SELECT exercise_id FROM last_ex)), 0)
      THEN rn ELSE rn + (SELECT count(*) FROM eligible)
    END
    LIMIT 1
  `) as Exercise[];
  return rows[0] ?? null;
}

/**
 * Creates the next sequential challenge for a user. Called at onboarding
 * (first challenge) and immediately after each completion (next unlock).
 */
export async function unlockNextChallenge(userId: string): Promise<{
  id: string;
  exercise: Exercise;
  target: number;
  sequence: number;
} | null> {
  const profileRows = (await sql()`
    SELECT u.date_of_birth AS dob, p.gender
    FROM users u LEFT JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ${userId}
  `) as { dob: string; gender: string | null }[];
  const profile = profileRows[0];
  if (!profile?.dob) return null;

  const exercise = await pickNextExercise(userId, profile.dob);
  if (!exercise) return null;

  const lastRows = (await sql()`
    SELECT c.sequence_number, c.target_value, cl.completed_value, cl.perceived_difficulty
    FROM challenges c
    LEFT JOIN challenge_logs cl ON cl.challenge_id = c.id
    WHERE c.user_id = ${userId} AND c.exercise_id = ${exercise.id}
      AND c.status = 'completed'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as {
    sequence_number: number;
    target_value: number;
    completed_value: number | null;
    perceived_difficulty: string | null;
  }[];

  const streakRows = (await sql()`
    SELECT current_streak FROM streaks WHERE user_id = ${userId}
  `) as { current_streak: number }[];
  const mealStreak = streakRows[0]?.current_streak ?? 0;

  const target = lastRows[0]
    ? nextTarget(
        exercise,
        profile,
        {
          target: lastRows[0].target_value,
          completedValue: lastRows[0].completed_value ?? lastRows[0].target_value,
          difficulty: lastRows[0].perceived_difficulty,
        },
        mealStreak
      )
    : startingTarget(exercise, profile);

  const seqRows = (await sql()`
    SELECT COALESCE(MAX(sequence_number), 0) + 1 AS seq
    FROM challenges WHERE user_id = ${userId}
  `) as { seq: number }[];
  const sequence = seqRows[0].seq;

  const inserted = (await sql()`
    INSERT INTO challenges (user_id, exercise_id, sequence_number, target_value, status)
    VALUES (${userId}, ${exercise.id}, ${sequence}, ${target}, 'active')
    RETURNING id
  `) as { id: string }[];

  return { id: inserted[0].id, exercise, target, sequence };
}
