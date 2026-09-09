import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { referralReport } from "@/lib/kpis";
import { requireOnboardedUser } from "@/lib/page-auth";
import { PROJECT_PRICE_DISPLAY, REFERRAL_CREDIT_DISPLAY, referralsEnabled } from "@/lib/pricing";
import { CompForm } from "./comp-form";

export const dynamic = "force-dynamic";

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

type CompRow = {
  id: string;
  email: string;
  amount_cents: number;
  reason: string;
  note: string | null;
  project_name: string | null;
  created_at: string;
};

/** Admin: referral program performance, credits, and comped projects. */
export default async function ReferralsAdminPage() {
  const { user } = await requireOnboardedUser("/admin/referrals");
  if (!isAdmin(user)) notFound();

  const [codes, ledger] = await Promise.all([
    referralReport(),
    sql()`
      SELECT l.id, u.email, l.amount_cents, l.reason, l.note, p.name AS project_name, l.created_at
      FROM credit_ledger l JOIN users u ON u.id = l.user_id LEFT JOIN projects p ON p.id = l.project_id
      ORDER BY l.created_at DESC LIMIT 100
    ` as unknown as Promise<CompRow[]>,
  ]);
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  const outstanding = ledger.reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-ink">Admin</Link> / Referrals &amp; credits
        </p>
        <h1 className="display text-5xl mb-3">Referral program</h1>
        <p className="text-sm text-ink-soft max-w-2xl mb-8">
          {referralsEnabled() ? (
            <>Program is <strong>open</strong>: members can claim a link in Settings.</>
          ) : (
            <>
              Program is <strong>not open yet</strong> (set <code>REFERRALS_ENABLED=true</code> in Vercel to
              launch — planned for Month 3). Attribution and credits already work; only the claim UI is hidden.
            </>
          )}{" "}
          {REFERRAL_CREDIT_DISPLAY} credit per activated referred project; credits redeem automatically once they
          cover a full {PROJECT_PRICE_DISPLAY} project. Outstanding credit liability: <strong>{money(outstanding)}</strong>.
        </p>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Codes <span className="text-ink-faint">{codes.length}</span></h2>
        <div className="overflow-x-auto mb-10">
          {codes.length === 0 ? (
            <p className="text-sm text-ink-faint">No codes claimed yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Code", "Owner", "Sign-ups", "Projects", "Activated", "Earned", "Redeemed"].map((h) => (
                    <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {codes.map((c) => (
                  <tr key={c.code}>
                    <td className="py-2.5 pr-4 font-mono">{c.code}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{c.name ?? c.email}</td>
                    <td className="py-2.5 pr-4">{c.signups}</td>
                    <td className="py-2.5 pr-4">{c.created}</td>
                    <td className="py-2.5 pr-4 font-semibold">{c.activated}</td>
                    <td className="py-2.5 pr-4">{money(c.earned_cents)}</td>
                    <td className="py-2.5">{money(c.redeemed_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Comp a project</h2>
        <p className="text-sm text-ink-soft mb-4 max-w-2xl">
          &ldquo;Try your next project on us&rdquo;: grant one project&apos;s worth of credit to an account by
          email. Outreach prospects who sign up through their tracked link get this automatically.
        </p>
        <div className="sheet p-6 max-w-lg mb-10">
          <CompForm />
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Credit ledger</h2>
        {ledger.length === 0 ? (
          <p className="text-sm text-ink-faint">No credits yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Date", "Account", "Amount", "Reason", "Project / note"].map((h) => (
                    <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ledger.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 pr-4 text-ink-soft">{fmt.format(new Date(r.created_at))}</td>
                    <td className="py-2.5 pr-4">{r.email}</td>
                    <td className={`py-2.5 pr-4 font-mono ${r.amount_cents < 0 ? "text-ink-faint" : ""}`}>
                      {r.amount_cents < 0 ? "−" : "+"}{money(Math.abs(r.amount_cents))}
                    </td>
                    <td className="py-2.5 pr-4">{r.reason}</td>
                    <td className="py-2.5 text-ink-soft">{r.project_name ?? r.note ?? "—"}</td>
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
