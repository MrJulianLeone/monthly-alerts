import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/api";

/** Parent dashboard: list my children with headline stats. */
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "parent");
  if ("response" in auth) return auth.response;

  const children = (await sql()`
    SELECT u.id, u.email, u.date_of_birth, u.last_active_at,
           p.display_name, p.gender, p.goal, p.weight_kg, p.height_cm,
           st.current_streak, st.longest_streak,
           s.status AS subscription_status, s.trial_ends_at,
           (SELECT count(*)::int FROM meal_logs m WHERE m.user_id = u.id
            AND m.logged_at > now() - interval '30 days') AS meals_30d,
           (SELECT count(*)::int FROM challenge_logs c WHERE c.user_id = u.id
            AND c.completed_at > now() - interval '30 days') AS challenges_30d
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u.parent_id = ${auth.user.id} AND u.deleted_at IS NULL
    ORDER BY p.display_name
  `) as Record<string, unknown>[];

  return NextResponse.json({ children });
}
