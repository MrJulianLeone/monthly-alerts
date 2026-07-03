import Link from "next/link";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card, Stat } from "@/components/ui";
import { BottomNav } from "@/components/bottom-nav";

export const metadata = { title: "My progress — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await requirePageUser();

  const [profileRows, challengeRows, summaries] = await Promise.all([
    sql()`
      SELECT p.display_name, st.current_streak, st.longest_streak,
             s.status AS subscription_status, s.trial_ends_at,
             (SELECT count(*)::int FROM meal_logs m WHERE m.user_id = ${user.id}) AS meals_total,
             (SELECT count(*)::int FROM challenge_logs c WHERE c.user_id = ${user.id}) AS challenges_total
      FROM profiles p
      LEFT JOIN streaks st ON st.user_id = p.user_id
      LEFT JOIN subscriptions s ON s.user_id = p.user_id
      WHERE p.user_id = ${user.id}`,
    sql()`
      SELECT c.target_value, e.name, e.unit
      FROM challenges c JOIN exercises e ON e.id = c.exercise_id
      WHERE c.user_id = ${user.id} AND c.status = 'active'
      ORDER BY c.sequence_number DESC LIMIT 1`,
    sql()`
      SELECT id, month, narrative FROM monthly_summaries
      WHERE user_id = ${user.id} ORDER BY month DESC LIMIT 12`,
  ]);

  const profile = (profileRows as Record<string, unknown>[])[0];
  const active = (challengeRows as { target_value: number; name: string; unit: string }[])[0];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 pb-28">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Hello, {(profile?.display_name as string) ?? "there"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Track your progress here, or jump into your coach chat any time.
          </p>
        </div>
        <Link
          href="/chat"
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          Open coach chat &rarr;
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Current streak" value={`${(profile?.current_streak as number) ?? 0} days`} />
        <Stat label="Best streak" value={`${(profile?.longest_streak as number) ?? 0} days`} />
        <Stat label="Meals logged" value={(profile?.meals_total as number) ?? 0} />
        <Stat label="Challenges done" value={(profile?.challenges_total as number) ?? 0} />
      </div>

      {active && (
        <Card className="mb-6">
          <h2 className="font-semibold text-neutral-900">Current challenge</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {active.name} — {active.target_value} {active.unit === "seconds" ? "seconds" : "reps"}.
            Complete it in the app and the next one unlocks immediately.
          </p>
        </Card>
      )}

      <Card>
        <h2 className="mb-4 font-semibold text-neutral-900">Monthly summaries</h2>
        {(summaries as { id: string; month: string; narrative: string | null }[]).length === 0 ? (
          <p className="text-sm text-neutral-500">
            Your first monthly progress summary arrives at the end of the month — keep logging
            meals and completing challenges.
          </p>
        ) : (
          <ul className="space-y-5">
            {(summaries as { id: string; month: string; narrative: string | null }[]).map((s) => (
              <li key={s.id} className="border-b border-neutral-100 pb-5 last:border-0">
                <p className="text-sm font-semibold text-neutral-900">
                  {new Date(s.month).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                  {s.narrative}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BottomNav active="home" />
    </main>
  );
}
