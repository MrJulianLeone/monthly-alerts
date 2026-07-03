import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { Card, PageHeading, Stat } from "@/components/ui";

export const metadata = { title: "Admin — MonthlyAlerts" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requirePageUser("admin");

  const [totalsRows, byCountry, byCity, recentSignups] = await Promise.all([
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
      GROUP BY country ORDER BY events DESC LIMIT 15`,
    sql()`
      SELECT country, city, count(*)::int AS events
      FROM analytics_events
      WHERE city IS NOT NULL AND created_at > now() - interval '30 days'
      GROUP BY country, city ORDER BY events DESC LIMIT 15`,
    sql()`
      SELECT u.email, u.created_at, u.role, p.display_name
      FROM users u LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC LIMIT 15`,
  ]);

  const totals = (totalsRows as Record<string, number>[])[0];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <PageHeading title="Admin dashboard" subtitle="Platform stats and IP-based geolocation analytics (last 30 days)." />

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Users" value={totals.total_users} />
        <Stat label="Active (7d)" value={totals.active_7d} />
        <Stat label="Parents" value={totals.total_parents} />
        <Stat label="Subscriptions" value={totals.active_subscriptions} />
        <Stat label="Meals logged" value={totals.total_meals} />
        <Stat label="Challenges done" value={totals.total_challenges} />
        <Stat label="Summaries sent" value={totals.summaries_generated} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold text-neutral-900">Traffic by country</h2>
          {(byCountry as { country: string; events: number; users: number }[]).length === 0 ? (
            <p className="text-sm text-neutral-500">No geolocation data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                  <th className="pb-2">Country</th>
                  <th className="pb-2 text-right">Events</th>
                  <th className="pb-2 text-right">Users</th>
                </tr>
              </thead>
              <tbody>
                {(byCountry as { country: string; events: number; users: number }[]).map((row) => (
                  <tr key={row.country} className="border-t border-neutral-100">
                    <td className="py-2 font-medium text-neutral-900">{row.country}</td>
                    <td className="py-2 text-right text-neutral-600">{row.events}</td>
                    <td className="py-2 text-right text-neutral-600">{row.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold text-neutral-900">Traffic by city</h2>
          {(byCity as { country: string; city: string; events: number }[]).length === 0 ? (
            <p className="text-sm text-neutral-500">No geolocation data yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                  <th className="pb-2">City</th>
                  <th className="pb-2 text-right">Events</th>
                </tr>
              </thead>
              <tbody>
                {(byCity as { country: string; city: string; events: number }[]).map((row) => (
                  <tr key={`${row.country}-${row.city}`} className="border-t border-neutral-100">
                    <td className="py-2 font-medium text-neutral-900">
                      {row.city}, {row.country}
                    </td>
                    <td className="py-2 text-right text-neutral-600">{row.events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold text-neutral-900">Recent signups</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-400">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2 text-right">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(recentSignups as { email: string; created_at: string; role: string; display_name: string | null }[]).map(
                (row) => (
                  <tr key={row.email} className="border-t border-neutral-100">
                    <td className="py-2 font-medium text-neutral-900">
                      {row.display_name ?? "—"}
                    </td>
                    <td className="py-2 text-neutral-600">{row.email}</td>
                    <td className="py-2 text-neutral-600">{row.role}</td>
                    <td className="py-2 text-right text-neutral-400">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </main>
  );
}
