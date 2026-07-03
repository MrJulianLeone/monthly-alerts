import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireCronSecret } from "@/lib/api";
import { generateMonthlySummary, previousMonthStart } from "@/lib/summaries";

export const maxDuration = 300;

/**
 * Runs on the 1st of each month: generates and delivers the previous month's
 * progress summary for every coached user active in that month. Idempotent —
 * safe to re-run if a batch fails partway.
 */
export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const monthStart = previousMonthStart();
  const monthISO = monthStart.toISOString().slice(0, 10);

  const users = (await sql()`
    SELECT DISTINCT u.id
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    WHERE u.deleted_at IS NULL
      AND u.created_at < ${monthISO}::date + interval '1 month'
      AND (
        EXISTS (SELECT 1 FROM meal_logs m WHERE m.user_id = u.id
                AND m.logged_at >= ${monthISO}::date
                AND m.logged_at < ${monthISO}::date + interval '1 month')
        OR EXISTS (SELECT 1 FROM challenge_logs c WHERE c.user_id = u.id
                AND c.completed_at >= ${monthISO}::date
                AND c.completed_at < ${monthISO}::date + interval '1 month')
      )
      AND NOT EXISTS (SELECT 1 FROM monthly_summaries s
                      WHERE s.user_id = u.id AND s.month = ${monthISO})
    LIMIT 200
  `) as { id: string }[];

  let generated = 0;
  const failures: string[] = [];
  for (const { id } of users) {
    try {
      await generateMonthlySummary(id, monthStart);
      generated++;
    } catch {
      failures.push(id);
    }
  }

  return NextResponse.json({ month: monthISO, candidates: users.length, generated, failures });
}
