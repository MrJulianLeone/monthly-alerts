import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card, PageHeading, Stat } from "@/components/ui";
import { ChildProfileForm } from "./profile-form";
import { SendSummaryButton } from "./send-summary-button";

export const metadata = { title: "Child progress — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser("parent");
  const { id } = await params;

  const rows = (await sql()`
    SELECT u.id, u.email, u.date_of_birth, u.last_active_at,
           p.display_name, p.gender, p.goal, p.weight_kg, p.height_cm,
           st.current_streak, st.longest_streak
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    WHERE u.id = ${id} AND u.parent_id = ${user.id} AND u.deleted_at IS NULL
  `) as Record<string, unknown>[];
  const child = rows[0];
  if (!child) notFound();

  const [meals, challenges, summaries] = await Promise.all([
    sql()`
      SELECT id, photo_url, meal_type, ai_feedback, logged_at
      FROM meal_logs WHERE user_id = ${id} ORDER BY logged_at DESC LIMIT 10`,
    sql()`
      SELECT c.sequence_number, c.target_value, c.completed_at, e.name, e.unit, cl.completed_value
      FROM challenges c
      JOIN exercises e ON e.id = c.exercise_id
      LEFT JOIN challenge_logs cl ON cl.challenge_id = c.id
      WHERE c.user_id = ${id} AND c.status = 'completed'
      ORDER BY c.completed_at DESC LIMIT 10`,
    sql()`
      SELECT id, month, narrative, email_sent_at FROM monthly_summaries
      WHERE user_id = ${id} ORDER BY month DESC LIMIT 12`,
  ]);

  const name = (child.display_name as string) ?? "Child";

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <PageHeading title={name} subtitle={`Login email: ${child.email as string}`} />

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Current streak" value={`${(child.current_streak as number) ?? 0} days`} />
        <Stat label="Best streak" value={`${(child.longest_streak as number) ?? 0} days`} />
        <Stat label="Meals logged" value={(meals as unknown[]).length >= 10 ? "10+" : (meals as unknown[]).length} />
        <Stat label="Challenges done" value={(challenges as unknown[]).length >= 10 ? "10+" : (challenges as unknown[]).length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Profile & goals</h2>
            <ChildProfileForm
              childId={id}
              initial={{
                displayName: name,
                goal: (child.goal as string) ?? "",
                weightKg: child.weight_kg ? String(child.weight_kg) : "",
                heightCm: child.height_cm ? String(child.height_cm) : "",
              }}
            />
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Monthly summaries</h2>
              <SendSummaryButton childId={id} />
            </div>
            {(summaries as { id: string; month: string; narrative: string | null; email_sent_at: string | null }[]).length === 0 ? (
              <p className="text-sm text-neutral-500">
                The first summary is generated at the end of the first month, or on demand.
              </p>
            ) : (
              <ul className="space-y-4">
                {(summaries as { id: string; month: string; narrative: string | null; email_sent_at: string | null }[]).map((s) => (
                  <li key={s.id} className="border-b border-neutral-100 pb-4 last:border-0">
                    <p className="text-sm font-semibold text-neutral-900">
                      {new Date(s.month).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                      {s.email_sent_at && (
                        <span className="ml-2 text-xs font-normal text-green-600">emailed</span>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-neutral-600">
                      {s.narrative}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Recent meals</h2>
            {(meals as { id: string; ai_feedback: string | null; logged_at: string }[]).length === 0 ? (
              <p className="text-sm text-neutral-500">No meals logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {(meals as { id: string; ai_feedback: string | null; logged_at: string }[]).map((m) => (
                  <li key={m.id} className="border-b border-neutral-100 pb-3 last:border-0">
                    <p className="text-xs text-neutral-400">
                      {new Date(m.logged_at).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-600">{m.ai_feedback}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-semibold text-neutral-900">Challenge history</h2>
            {(challenges as { sequence_number: number; name: string; target_value: number; unit: string; completed_at: string }[]).length === 0 ? (
              <p className="text-sm text-neutral-500">No challenges completed yet.</p>
            ) : (
              <ul className="space-y-2">
                {(challenges as { sequence_number: number; name: string; target_value: number; unit: string; completed_at: string }[]).map((c) => (
                  <li
                    key={c.sequence_number}
                    className="flex items-center justify-between border-b border-neutral-100 pb-2 text-sm last:border-0"
                  >
                    <span className="text-neutral-900">
                      #{c.sequence_number} {c.name} — {c.target_value}{" "}
                      {c.unit === "seconds" ? "sec" : "reps"}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(c.completed_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
