import Link from "next/link";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { ageFromDob } from "@/lib/auth";
import { Stat } from "@/components/ui";
import { AppShell } from "@/components/app-shell";
import { LogoutButton } from "@/components/logout-button";
import { WeightForm } from "./weight-form";
import { InviteForms } from "./invite-forms";
import { ThemeToggle } from "./theme-toggle";

export const metadata = { title: "Settings — MonthlyAlerts" };
export const dynamic = "force-dynamic";

const GOAL_LABELS: Record<string, string> = {
  lose_weight: "Lose weight",
  build_strength: "Build strength",
  get_fit: "Get fit",
  build_habits: "Build habits",
};

export default async function SettingsPage() {
  const user = await requirePageUser();

  const [profileRows, summaries] = await Promise.all([
    sql()`
      SELECT p.display_name, p.goal, st.current_streak, st.longest_streak,
             s.status AS subscription_status, s.trial_ends_at,
             (SELECT count(*)::int FROM meal_logs m WHERE m.user_id = ${user.id}) AS meals_total,
             (SELECT count(*)::int FROM challenge_logs c WHERE c.user_id = ${user.id}) AS challenges_total
      FROM profiles p
      LEFT JOIN streaks st ON st.user_id = p.user_id
      LEFT JOIN subscriptions s ON s.user_id = p.user_id
      WHERE p.user_id = ${user.id}`,
    sql()`
      SELECT id, month, narrative FROM monthly_summaries
      WHERE user_id = ${user.id} ORDER BY month DESC LIMIT 12`,
  ]);

  const profile = (profileRows as Record<string, unknown>[])[0];
  const isAdult =
    user.role === "parent" ||
    user.role === "admin" ||
    (user.date_of_birth !== null && ageFromDob(user.date_of_birth) >= 18);
  const subscriptionStatus = (profile?.subscription_status as string) ?? null;
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at as string) : null;
  const trialActive = trialEndsAt !== null && trialEndsAt > new Date();

  if (!profile) {
    return (
      <AppShell title="Settings" backHref="/chat" hideNav>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-neutral-900">No coaching profile yet</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Start your coaching to unlock the app.
          </p>
          <Link
            href="/enroll"
            className="mt-4 inline-block rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Start my coaching
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings" subtitle="Account, progress, and subscription" backHref="/chat" hideNav>
      <div className="space-y-4">
        {/* Account */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-base font-semibold text-neutral-900">
            {(profile.display_name as string) ?? "—"}
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">{user.email}</p>
          <p className="mt-0.5 text-sm text-neutral-500">
            Goal: {GOAL_LABELS[(profile.goal as string) ?? ""] ?? "Not set"}
          </p>
        </section>

        {/* Progress */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-neutral-900">Progress</h2>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Current streak" value={`${(profile.current_streak as number) ?? 0} days`} />
            <Stat label="Best streak" value={`${(profile.longest_streak as number) ?? 0} days`} />
            <Stat label="Meals logged" value={(profile.meals_total as number) ?? 0} />
            <Stat label="Challenges done" value={(profile.challenges_total as number) ?? 0} />
          </div>
        </section>

        {/* Subscription */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Subscription</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {subscriptionStatus === "active"
              ? "Active — thanks for being a member."
              : trialActive
                ? `Free trial until ${trialEndsAt!.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}.`
                : "Trial ended — subscribe to keep your coaching going."}
          </p>
          {subscriptionStatus !== "active" && (
            <Link
              href="/subscribe"
              className="mt-3 inline-block rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Manage subscription
            </Link>
          )}
        </section>

        {/* Invites: friends for everyone, family for adults */}
        <InviteForms isAdult={isAdult} />

        {/* Appearance */}
        <ThemeToggle />

        {/* Weight */}
        <WeightForm />

        {/* Monthly summaries */}
        <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-neutral-900">Monthly summaries</h2>
          {(summaries as { id: string; month: string; narrative: string | null }[]).length === 0 ? (
            <p className="text-sm text-neutral-500">
              Your first monthly progress summary arrives at the end of the month — keep
              logging meals and completing challenges.
            </p>
          ) : (
            <ul className="space-y-4">
              {(summaries as { id: string; month: string; narrative: string | null }[]).map((s) => (
                <li key={s.id} className="border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
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
        </section>

        {user.role === "admin" && (
          <Link
            href="/admin"
            className="block w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
          >
            Admin dashboard
          </Link>
        )}

        <LogoutButton className="block w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-center text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900" />
      </div>
    </AppShell>
  );
}
