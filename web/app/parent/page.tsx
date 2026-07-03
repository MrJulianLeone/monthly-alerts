import Link from "next/link";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card, PageHeading } from "@/components/ui";

export const metadata = { title: "Parent dashboard — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function ParentDashboard() {
  const user = await requirePageUser("parent");

  const children = (await sql()`
    SELECT u.id, u.last_active_at, p.display_name, p.goal,
           st.current_streak,
           s.status AS subscription_status, s.trial_ends_at,
           (SELECT count(*)::int FROM meal_logs m WHERE m.user_id = u.id
            AND m.logged_at > now() - interval '30 days') AS meals_30d,
           (SELECT count(*)::int FROM challenge_logs c WHERE c.user_id = u.id
            AND c.completed_at > now() - interval '30 days') AS challenges_30d
    FROM users u
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN streaks st ON st.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE u.parent_id = ${user.id} AND u.deleted_at IS NULL
    ORDER BY p.display_name
  `) as {
    id: string;
    last_active_at: string | null;
    display_name: string | null;
    goal: string | null;
    current_streak: number | null;
    subscription_status: string | null;
    trial_ends_at: string | null;
    meals_30d: number;
    challenges_30d: number;
  }[];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <PageHeading
        title="Parent dashboard"
        subtitle="Follow your children's progress. You'll also receive their monthly summary by email."
      />
      {children.length === 0 ? (
        <Card>
          <p className="text-sm text-neutral-500">
            No child accounts yet. When your child starts onboarding in the app and enters
            your email, you&apos;ll receive a secure setup link.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <Link key={child.id} href={`/parent/children/${child.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-neutral-900">
                      {child.display_name ?? "Child"}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Goal: {child.goal?.replace(/_/g, " ") ?? "not set"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      child.subscription_status === "active" ||
                      (child.trial_ends_at && new Date(child.trial_ends_at) > new Date())
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {child.subscription_status === "active"
                      ? "Subscribed"
                      : child.trial_ends_at && new Date(child.trial_ends_at) > new Date()
                        ? "Free trial"
                        : "Trial ended"}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <dt className="text-xs text-neutral-500">Meals (30d)</dt>
                    <dd className="text-lg font-semibold">{child.meals_30d}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Challenges (30d)</dt>
                    <dd className="text-lg font-semibold">{child.challenges_30d}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">Streak</dt>
                    <dd className="text-lg font-semibold">{child.current_streak ?? 0}d</dd>
                  </div>
                </dl>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
