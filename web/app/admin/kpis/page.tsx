import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { KPI_TARGETS, monthlyKpis, SPEND_CHANNELS } from "@/lib/kpis";
import { requireOnboardedUser } from "@/lib/page-auth";
import { SpendForm } from "./spend-form";

export const dynamic = "force-dynamic";

const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");

/**
 * Marketing KPIs (admin): the north-star cost per activated project by
 * month and channel, funnel conversion, and the plan's targets. Visitors
 * live in Vercel Analytics; spend is entered here per channel.
 */
export default async function KpisPage() {
  const { user } = await requireOnboardedUser("/admin/kpis");
  if (!isAdmin(user)) notFound();
  const months = await monthlyKpis(6);
  const channels = Array.from(
    new Set(months.flatMap((m) => [...Object.keys(m.by_channel), ...Object.keys(m.spend_cents)]))
  ).sort();

  const th = (label: string) => (
    <th key={label} className="microlabel font-normal py-2 pr-4 text-left whitespace-nowrap">
      {label}
    </th>
  );

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-ink">Admin</Link> / Marketing KPIs
        </p>
        <h1 className="display text-5xl mb-2">Cost per activated project</h1>
        <p className="text-sm text-ink-soft max-w-2xl mb-8">
          North-star KPI. Targets: direct CAC under {money(KPI_TARGETS.directCacMaxCents)}, referral/organic under{" "}
          {money(KPI_TARGETS.referralCacMaxCents)}, blended under {money(KPI_TARGETS.blendedCacMaxCents)}, professional
          acquisition under {money(KPI_TARGETS.professionalCacMaxCents)} (with 5+ projects/yr each). Funnel: visitor →
          project creation over {Math.round(KPI_TARGETS.visitorToProjectMin * 100)}% (visitors: Vercel Analytics), creation →
          activated over {Math.round(KPI_TARGETS.projectToPaidMin * 100)}%, referral + organic share over{" "}
          {Math.round(KPI_TARGETS.referralOrganicShareMin * 100)}% by month 6.
        </p>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Monthly funnel</h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Month", "Sign-ups", "Projects", "Activated", "Paid (Stripe)", "Create → activate", "Revenue", "Spend", "Blended CAC", "Referral+organic share"].map(th)}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {months.map((m) => {
                const refOrg =
                  (m.by_channel.referral?.activated ?? 0) +
                  (m.by_channel.organic?.activated ?? 0) +
                  (m.by_channel.content?.activated ?? 0);
                const cac = m.activated > 0 && m.spend_total_cents > 0 ? money(m.spend_total_cents / m.activated) : "—";
                const conv = m.projects_created > 0 ? m.activated / m.projects_created : null;
                return (
                  <tr key={m.month}>
                    <td className="py-2.5 pr-4 font-mono">{m.month}</td>
                    <td className="py-2.5 pr-4">{m.signups}</td>
                    <td className="py-2.5 pr-4">{m.projects_created}</td>
                    <td className="py-2.5 pr-4 font-semibold">{m.activated}</td>
                    <td className="py-2.5 pr-4">{m.activated_paid}</td>
                    <td className={`py-2.5 pr-4 ${conv !== null && conv < KPI_TARGETS.projectToPaidMin ? "text-red-700" : ""}`}>
                      {pct(m.activated, m.projects_created)}
                    </td>
                    <td className="py-2.5 pr-4">{money(m.revenue_cents)}</td>
                    <td className="py-2.5 pr-4">{money(m.spend_total_cents)}</td>
                    <td className="py-2.5 pr-4 font-semibold">{cac}</td>
                    <td className="py-2.5">{pct(refOrg, m.activated)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">By channel (activated / created · spend · CAC)</h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-sm">
            <thead>
              <tr>{["Month", ...channels].map(th)}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {months.map((m) => (
                <tr key={m.month}>
                  <td className="py-2.5 pr-4 font-mono">{m.month}</td>
                  {channels.map((c) => {
                    const ch = m.by_channel[c] ?? { created: 0, activated: 0 };
                    const spend = m.spend_cents[c] ?? 0;
                    const cac = ch.activated > 0 && spend > 0 ? money(spend / ch.activated) : "—";
                    const limit =
                      c === "referral" || c === "organic" || c === "content"
                        ? KPI_TARGETS.referralCacMaxCents
                        : c === "outreach" || c === "partnerships"
                          ? KPI_TARGETS.professionalCacMaxCents
                          : KPI_TARGETS.directCacMaxCents;
                    const over = ch.activated > 0 && spend > 0 && spend / ch.activated > limit;
                    return (
                      <td key={c} className="py-2.5 pr-4 whitespace-nowrap">
                        <span className="font-semibold">{ch.activated}</span>
                        <span className="text-ink-faint">/{ch.created}</span>
                        {spend > 0 && (
                          <span className="text-ink-soft"> · {money(spend)} · <span className={over ? "text-red-700" : ""}>{cac}</span></span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {channels.length === 0 && <p className="text-sm text-ink-faint">No attributed projects yet.</p>}
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Record spend</h2>
        <p className="text-sm text-ink-soft mb-4">
          Enter each channel&apos;s spend for a month (whole dollars); CAC updates above. Channels:{" "}
          {SPEND_CHANNELS.join(", ")}.
        </p>
        <div className="sheet p-6 max-w-lg">
          <SpendForm channels={[...SPEND_CHANNELS]} defaultMonth={months[0]?.month ?? ""} />
        </div>
      </main>
    </div>
  );
}
