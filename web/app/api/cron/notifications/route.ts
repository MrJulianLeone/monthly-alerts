import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireCronSecret } from "@/lib/api";
import { sendPush, type NotificationKind } from "@/lib/push";

export const maxDuration = 300;

/**
 * Smart daily nudges, run every 2 hours. Each user's local time decides which
 * nudge applies; sendPush enforces the daily cap and per-kind dedupe.
 *   ~12:00 local  meal_nudge       if no meal logged today
 *   ~17:00 local  challenge        if the active challenge wasn't completed today
 *   ~20:00 local  evening_checkin  if nothing was logged today
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const candidates = (await sql()`
    SELECT u.id,
           p.display_name,
           EXTRACT(HOUR FROM now() AT TIME ZONE COALESCE(p.timezone, 'UTC'))::int AS local_hour,
           EXISTS (SELECT 1 FROM meal_logs m WHERE m.user_id = u.id
                   AND m.logged_at >= date_trunc('day', now() AT TIME ZONE COALESCE(p.timezone,'UTC')) AT TIME ZONE COALESCE(p.timezone,'UTC')) AS meal_today,
           EXISTS (SELECT 1 FROM challenge_logs c WHERE c.user_id = u.id
                   AND c.completed_at >= date_trunc('day', now() AT TIME ZONE COALESCE(p.timezone,'UTC')) AT TIME ZONE COALESCE(p.timezone,'UTC')) AS challenge_today
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    JOIN push_tokens pt ON pt.user_id = u.id
    WHERE u.role = 'user' AND u.deleted_at IS NULL
      AND u.last_active_at > now() - interval '30 days'
    GROUP BY u.id, p.display_name, p.timezone
    LIMIT 500
  `) as {
    id: string;
    display_name: string;
    local_hour: number;
    meal_today: boolean;
    challenge_today: boolean;
  }[];

  let sent = 0;
  for (const user of candidates) {
    let kind: NotificationKind | null = null;
    let title = "";
    let body = "";

    if (user.local_hour >= 11 && user.local_hour < 14 && !user.meal_today) {
      kind = "meal_nudge";
      title = "Lunch check-in";
      body = "Snap a photo of your meal and I'll take a look.";
    } else if (user.local_hour >= 16 && user.local_hour < 19 && !user.challenge_today) {
      kind = "challenge";
      title = "Today's challenge is waiting";
      body = "A few focused minutes is all it takes. Tap to see your challenge.";
    } else if (
      user.local_hour >= 19 &&
      user.local_hour < 22 &&
      !user.meal_today &&
      !user.challenge_today
    ) {
      kind = "evening_checkin";
      title = "Evening check-in";
      body = "Still time to log a meal or finish your challenge today.";
    }

    if (kind && (await sendPush(user.id, kind, title, body))) sent++;
  }

  return NextResponse.json({ candidates: candidates.length, sent });
}
