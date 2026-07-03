import { sql } from "@/lib/db";

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
