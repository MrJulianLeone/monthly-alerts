import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRole } from "@/lib/api";

/** Admin dashboard data: platform stats + IP-based geolocation analytics. */
export async function GET(request: NextRequest) {
  const auth = await requireRole(request, "admin");
  if ("response" in auth) return auth.response;

  const [totals, byCountry, byCity, recentSignups, recentEvents] = await Promise.all([
    sql()`
      SELECT
        (SELECT count(*)::int FROM users WHERE role = 'user' AND deleted_at IS NULL) AS total_users,
        (SELECT count(*)::int FROM users WHERE role = 'parent' AND deleted_at IS NULL) AS total_parents,
        (SELECT count(*)::int FROM users WHERE role = 'user' AND deleted_at IS NULL
          AND last_active_at > now() - interval '7 days') AS active_7d,
        (SELECT count(*)::int FROM meal_logs) AS total_meals,
        (SELECT count(*)::int FROM challenge_logs) AS total_challenges,
        (SELECT count(*)::int FROM subscriptions WHERE status = 'active') AS active_subscriptions,
        (SELECT count(*)::int FROM monthly_summaries) AS summaries_generated`,
    sql()`
      SELECT country, count(*)::int AS events, count(DISTINCT user_id)::int AS users
      FROM analytics_events
      WHERE country IS NOT NULL AND created_at > now() - interval '30 days'
      GROUP BY country ORDER BY events DESC LIMIT 20`,
    sql()`
      SELECT country, city, count(*)::int AS events
      FROM analytics_events
      WHERE city IS NOT NULL AND created_at > now() - interval '30 days'
      GROUP BY country, city ORDER BY events DESC LIMIT 20`,
    sql()`
      SELECT u.email, u.created_at, u.role, p.display_name
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC LIMIT 20`,
    sql()`
      SELECT event, count(*)::int AS n
      FROM analytics_events
      WHERE created_at > now() - interval '7 days'
      GROUP BY event ORDER BY n DESC`,
  ]);

  return NextResponse.json({
    totals: (totals as Record<string, unknown>[])[0],
    byCountry,
    byCity,
    recentSignups,
    recentEvents,
  });
}
