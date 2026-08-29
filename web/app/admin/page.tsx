import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { billingEnabled, PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { sql } from "@/lib/db";
import { langName, type Lang } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { projectExpiresAt } from "@/lib/projects";
import { countUnread } from "@/lib/support";

export const dynamic = "force-dynamic";

// Admin-only surface for the site operator; not localized.

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  preferred_language: Lang;
  created_at: string;
  onboarded_at: string | null;
  project_count: number;
};

type ProjectRow = {
  id: string;
  name: string;
  owner_email: string;
  member_count: number;
  item_count: number;
  done_count: number;
  paid_at: string | null;
  stripe_session_id: string | null;
  amount_paid_cents: number | null;
  archived_at: string | null;
  extended_years: number;
  created_at: string;
};

export default async function AdminPage() {
  const { user } = await requireOnboardedUser("/admin");
  if (!isAdmin(user)) notFound();

  const [users, projects, unreadSupport] = await Promise.all([
    sql()`
      SELECT u.id, u.email, u.name, u.company, u.preferred_language, u.created_at, u.onboarded_at,
             (SELECT count(*) FROM project_members m WHERE m.user_id = u.id)::int AS project_count
      FROM users u
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    ` as unknown as Promise<UserRow[]>,
    sql()`
      SELECT p.id, p.name, o.email AS owner_email, p.paid_at, p.stripe_session_id,
             p.amount_paid_cents, p.archived_at, p.extended_years, p.created_at,
             (SELECT count(*) FROM project_members m WHERE m.project_id = p.id)::int AS member_count,
             (SELECT count(*) FROM items i WHERE i.project_id = p.id)::int AS item_count,
             (SELECT count(*) FROM items i WHERE i.project_id = p.id AND i.status = 'done')::int AS done_count
      FROM projects p JOIN users o ON o.id = p.owner_id
      ORDER BY p.created_at DESC
    ` as unknown as Promise<ProjectRow[]>,
    countUnread(),
  ]);

  const payments = projects.filter((p) => p.paid_at);
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  const price = Number(PROJECT_PRICE_DISPLAY.replace(/[^0-9.]/g, ""));
  const revenue =
    payments.reduce((sum, p) => sum + (p.amount_paid_cents ?? price * 100), 0) / 100;
  const amountOf = (p: ProjectRow) =>
    p.amount_paid_cents !== null
      ? `$${(p.amount_paid_cents / 100).toLocaleString()}`
      : PROJECT_PRICE_DISPLAY;

  const stat = (label: string, value: string | number) => (
    <div className="bg-sheet p-6">
      <p className="microlabel mb-2">{label}</p>
      <p className="display text-4xl">{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">Site administration</p>
        <div className="flex items-end justify-between gap-4 mb-8">
          <h1 className="display text-5xl">Admin</h1>
          <Link href="/admin/inbox" className="btn btn-ghost btn-sm">
            Support inbox
            {unreadSupport > 0 && <span className="text-accent-deep">{unreadSupport}</span>}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-strong border-[1.5px] border-line-strong mb-10">
          {stat("Users", users.length)}
          {stat("Projects", projects.length)}
          {stat("Payments", payments.length)}
          {stat("Revenue", `$${revenue.toLocaleString()}`)}
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">
          Projects <span className="text-ink-faint">{projects.length}</span>
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Project", "Owner", "Members", "Items", "Paid", "Expires", "Created"].map((h) => (
                  <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 pr-4">
                    <Link href={`/projects/${p.id}`} className="font-medium hover:text-accent-deep">
                      {p.name}
                    </Link>
                    {p.archived_at && <span className="chip text-ink-faint ml-2">archived</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-soft">{p.owner_email}</td>
                  <td className="py-2.5 pr-4">{p.member_count}</td>
                  <td className="py-2.5 pr-4">{p.done_count}/{p.item_count}</td>
                  <td className="py-2.5 pr-4">
                    {p.paid_at ? fmt.format(new Date(p.paid_at)) : <span className="text-ink-faint">free</span>}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-soft">{fmt.format(projectExpiresAt(p))}</td>
                  <td className="py-2.5 text-ink-soft">{fmt.format(new Date(p.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">
          Users <span className="text-ink-faint">{users.length}</span>
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                {["Email", "Name", "Company", "Language", "Projects", "Joined"].map((h) => (
                  <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2.5 pr-4 font-medium">
                    {u.email}
                    {!u.onboarded_at && <span className="chip text-ink-faint ml-2">pending</span>}
                  </td>
                  <td className="py-2.5 pr-4">{u.name ?? "—"}</td>
                  <td className="py-2.5 pr-4 text-ink-soft">{u.company ?? "—"}</td>
                  <td className="py-2.5 pr-4">{langName(u.preferred_language)}</td>
                  <td className="py-2.5 pr-4">{u.project_count}</td>
                  <td className="py-2.5 text-ink-soft">{fmt.format(new Date(u.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">
          Payments <span className="text-ink-faint">{payments.length}</span>
        </h2>
        {!billingEnabled() && (
          <p className="microlabel mb-3">Billing is currently disabled — new projects are free.</p>
        )}
        {payments.length === 0 ? (
          <p className="text-sm text-ink-faint">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Date", "Project", "Owner", "Amount", "Stripe session"].map((h) => (
                    <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-4">{fmt.format(new Date(p.paid_at!))}</td>
                    <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{p.owner_email}</td>
                    <td className="py-2.5 pr-4">{amountOf(p)}</td>
                    <td className="py-2.5 font-mono text-xs text-ink-faint">
                      {p.stripe_session_id ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
