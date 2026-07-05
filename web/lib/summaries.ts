import { sql } from "@/lib/db";
import { monthlyNarrative, type MonthlyStats } from "@/lib/ai";
import { addChatMessage } from "@/lib/coach";
import { sendMonthlySummaryEmail } from "@/lib/email";

function monthLabel(month: Date): string {
  return month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/**
 * Generates the monthly progress summary for one user and month, stores it,
 * posts it into the chat, and emails it (to the parent for minors, otherwise
 * to the user). Idempotent per (user, month). Returns the summary id.
 */
export async function generateMonthlySummary(
  userId: string,
  monthStart: Date
): Promise<string | null> {
  const db = sql();
  const monthISO = monthStart.toISOString().slice(0, 10);

  const existing = (await db`
    SELECT id FROM monthly_summaries
    WHERE user_id = ${userId} AND month = ${monthISO}
  `) as { id: string }[];
  if (existing.length > 0) return existing[0].id;

  // Coached users are identified by having a profile (any role — parents can
  // enroll themselves too).
  const userRows = (await db`
    SELECT u.email, u.parent_id, p.display_name,
           parent.email AS parent_email
    FROM users u
    JOIN profiles p ON p.user_id = u.id
    LEFT JOIN users parent ON parent.id = u.parent_id
    WHERE u.id = ${userId} AND u.deleted_at IS NULL
  `) as {
    email: string;
    parent_id: string | null;
    display_name: string | null;
    parent_email: string | null;
  }[];
  const user = userRows[0];
  if (!user) return null;

  const stats = (await db`
    WITH bounds AS (
      SELECT ${monthISO}::date AS m_start,
             (${monthISO}::date + interval '1 month') AS m_end
    )
    SELECT
      (SELECT count(*)::int FROM meal_logs, bounds
       WHERE user_id = ${userId} AND logged_at >= m_start AND logged_at < m_end) AS meals_logged,
      (SELECT count(*)::int FROM challenge_logs, bounds
       WHERE user_id = ${userId} AND completed_at >= m_start AND completed_at < m_end) AS challenges_completed,
      (SELECT count(DISTINCT logged_at::date)::int FROM meal_logs, bounds
       WHERE user_id = ${userId} AND logged_at >= m_start AND logged_at < m_end) AS active_days,
      (SELECT COALESCE(MAX(current_streak), 0)::int FROM streaks WHERE user_id = ${userId}) AS current_streak,
      (SELECT COALESCE(MAX(longest_streak), 0)::int FROM streaks WHERE user_id = ${userId}) AS best_streak,
      (SELECT weight_kg::float FROM weight_entries, bounds
       WHERE user_id = ${userId} AND recorded_at < m_end
       ORDER BY recorded_at ASC LIMIT 1) AS weight_start_kg,
      (SELECT weight_kg::float FROM weight_entries, bounds
       WHERE user_id = ${userId} AND recorded_at < m_end
       ORDER BY recorded_at DESC LIMIT 1) AS weight_end_kg,
      (SELECT count(*)::int FROM meal_logs, bounds
       WHERE user_id = ${userId}
         AND logged_at >= m_start - interval '1 month' AND logged_at < m_start) AS prev_meals_logged,
      (SELECT count(*)::int FROM challenge_logs, bounds
       WHERE user_id = ${userId}
         AND completed_at >= m_start - interval '1 month' AND completed_at < m_start) AS prev_challenges_completed
  `) as Record<string, number | null>[];

  const s = stats[0];
  const weightDelta =
    s.weight_start_kg !== null && s.weight_end_kg !== null
      ? Math.round((Number(s.weight_end_kg) - Number(s.weight_start_kg)) * 10) / 10
      : null;

  const label = monthLabel(monthStart);
  const fullStats: MonthlyStats = {
    month: label,
    meals_logged: Number(s.meals_logged ?? 0),
    challenges_completed: Number(s.challenges_completed ?? 0),
    best_streak: Number(s.best_streak ?? 0),
    current_streak: Number(s.current_streak ?? 0),
    active_days: Number(s.active_days ?? 0),
    weight_start_kg: s.weight_start_kg as number | null,
    weight_end_kg: s.weight_end_kg as number | null,
    weight_delta_kg: weightDelta,
    prev_meals_logged: s.prev_meals_logged as number | null,
    prev_challenges_completed: s.prev_challenges_completed as number | null,
  };

  const displayName = user.display_name ?? "there";
  let narrative = "";
  try {
    narrative = await monthlyNarrative(displayName, fullStats);
  } catch {
    narrative = `In ${label}, you logged ${fullStats.meals_logged} meals and completed ${fullStats.challenges_completed} challenges, with a best streak of ${fullStats.best_streak} days. Keep building the habit next month.`;
  }

  const inserted = (await db`
    INSERT INTO monthly_summaries (user_id, month, stats, narrative)
    VALUES (${userId}, ${monthISO}, ${JSON.stringify(fullStats)}, ${narrative})
    ON CONFLICT (user_id, month) DO UPDATE SET narrative = EXCLUDED.narrative
    RETURNING id
  `) as { id: string }[];
  const summaryId = inserted[0].id;

  await addChatMessage(
    userId,
    "coach",
    "monthly_summary",
    `Your ${label} progress summary is ready: ${fullStats.meals_logged} meals logged, ${fullStats.challenges_completed} challenges completed, best streak ${fullStats.best_streak} days.`,
    { summary_id: summaryId }
  );

  // Email the parent for minors, otherwise the user directly. Guests have no
  // email on file — their summary still lands in the chat above.
  const recipient = user.parent_email ?? user.email;
  if (!recipient) return summaryId;
  try {
    await sendMonthlySummaryEmail(recipient, displayName, label, narrative, {
      meals_logged: fullStats.meals_logged,
      challenges_completed: fullStats.challenges_completed,
      best_streak: fullStats.best_streak,
      weight_delta_kg: weightDelta,
    });
    await db`
      UPDATE monthly_summaries SET email_sent_at = now() WHERE id = ${summaryId}
    `;
  } catch {
    // Email failure shouldn't lose the summary; cron can be re-run.
  }

  return summaryId;
}

/** First day of the previous month (UTC). */
export function previousMonthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
}
