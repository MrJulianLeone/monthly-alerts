import { sql } from "@/lib/db";

export type NotificationKind = "meal_nudge" | "challenge" | "evening_checkin";

const DAILY_CAP = 3; // max 2–3 smart notifications per day

/**
 * Sends a push notification to all of a user's devices via Expo, respecting
 * the daily cap and one-per-kind-per-day rule. Returns true if sent.
 */
export async function sendPush(
  userId: string,
  kind: NotificationKind,
  title: string,
  body: string
): Promise<boolean> {
  const counts = (await sql()`
    SELECT
      count(*)::int AS today,
      count(*) FILTER (WHERE kind = ${kind})::int AS today_kind
    FROM notification_logs
    WHERE user_id = ${userId} AND sent_at >= date_trunc('day', now())
  `) as { today: number; today_kind: number }[];
  if (counts[0].today >= DAILY_CAP || counts[0].today_kind > 0) return false;

  const tokens = (await sql()`
    SELECT expo_push_token FROM push_tokens WHERE user_id = ${userId}
  `) as { expo_push_token: string }[];
  if (tokens.length === 0) return false;

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      tokens.map((t) => ({
        to: t.expo_push_token,
        title,
        body,
        sound: "default",
      }))
    ),
  });
  if (!response.ok) return false;

  await sql()`
    INSERT INTO notification_logs (user_id, kind) VALUES (${userId}, ${kind})
  `;
  return true;
}
