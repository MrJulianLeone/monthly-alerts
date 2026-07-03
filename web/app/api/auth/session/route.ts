import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { effectiveRole } from "@/lib/admin";
import { requireUser } from "@/lib/api";

/** Current user + profile + subscription snapshot (used by mobile at launch). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const rows = (await sql()`
    SELECT u.id, u.email, u.role, u.date_of_birth,
           p.display_name, p.gender, p.height_cm, p.weight_kg, p.goal, p.timezone,
           s.status AS subscription_status, s.trial_ends_at,
           st.current_streak, st.longest_streak
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    WHERE u.id = ${auth.user.id}
  `) as Record<string, unknown>[];

  const user = rows[0] ?? null;
  if (user) user.role = effectiveRole(String(user.email), String(user.role));
  return NextResponse.json({ user });
}
