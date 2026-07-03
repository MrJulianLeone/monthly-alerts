import { sql } from "@/lib/db";
import { unlockNextChallenge } from "@/lib/progression";

export type ChatKind =
  | "text"
  | "meal_photo"
  | "challenge_prompt"
  | "challenge_complete"
  | "monthly_summary"
  | "system";

export async function addChatMessage(
  userId: string,
  sender: "coach" | "user",
  kind: ChatKind,
  content: string | null,
  metadata: Record<string, unknown> = {}
): Promise<string> {
  const rows = (await sql()`
    INSERT INTO chat_messages (user_id, sender, kind, content, metadata)
    VALUES (${userId}, ${sender}, ${kind}, ${content}, ${JSON.stringify(metadata)})
    RETURNING id
  `) as { id: string }[];
  return rows[0].id;
}

export type ActiveChallenge = {
  id: string;
  sequence_number: number;
  target_value: number;
  name: string;
  unit: string;
};

/** Returns the user's active challenge, unlocking the next one if none is open. */
export async function getOrUnlockActiveChallenge(
  userId: string
): Promise<ActiveChallenge | null> {
  const rows = (await sql()`
    SELECT c.id, c.sequence_number, c.target_value, e.name, e.unit
    FROM challenges c JOIN exercises e ON e.id = c.exercise_id
    WHERE c.user_id = ${userId} AND c.status = 'active'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as ActiveChallenge[];
  if (rows[0]) return rows[0];

  const unlocked = await unlockNextChallenge(userId);
  if (!unlocked) return null;
  return {
    id: unlocked.id,
    sequence_number: unlocked.sequence,
    target_value: unlocked.target,
    name: unlocked.exercise.name,
    unit: unlocked.exercise.unit,
  };
}

/**
 * Posts a reminder of the user's current challenge as the newest chat message,
 * so the active challenge always stays visible at the bottom of the feed (e.g.
 * right after a meal is logged). Returns the challenge that was surfaced.
 */
export async function remindActiveChallenge(
  userId: string
): Promise<ActiveChallenge | null> {
  const challenge = await getOrUnlockActiveChallenge(userId);
  if (!challenge) return null;

  const unitLabel = challenge.unit === "seconds" ? "seconds" : "reps";
  await addChatMessage(
    userId,
    "coach",
    "challenge_prompt",
    `Your current challenge is still on: ${challenge.name} — ${challenge.target_value} ${unitLabel}. Tap "I Did It" when you finish.`,
    { challenge_id: challenge.id }
  );
  return challenge;
}

/**
 * Updates the meal-logging streak for a user (call after each meal log).
 * A streak continues if the previous log was yesterday (in the user's
 * timezone) and increments once per day.
 */
export async function updateMealStreak(userId: string): Promise<number> {
  const rows = (await sql()`
    WITH tz AS (
      SELECT COALESCE(p.timezone, 'UTC') AS timezone
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ${userId}
    ),
    today AS (
      SELECT (now() AT TIME ZONE (SELECT timezone FROM tz))::date AS d
    )
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_logged_date)
    VALUES (${userId}, 1, 1, (SELECT d FROM today))
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = CASE
        WHEN streaks.last_logged_date = (SELECT d FROM today) THEN streaks.current_streak
        WHEN streaks.last_logged_date = (SELECT d FROM today) - 1 THEN streaks.current_streak + 1
        ELSE 1
      END,
      longest_streak = GREATEST(streaks.longest_streak, CASE
        WHEN streaks.last_logged_date = (SELECT d FROM today) THEN streaks.current_streak
        WHEN streaks.last_logged_date = (SELECT d FROM today) - 1 THEN streaks.current_streak + 1
        ELSE 1
      END),
      last_logged_date = (SELECT d FROM today)
    RETURNING current_streak
  `) as { current_streak: number }[];
  return rows[0]?.current_streak ?? 1;
}
