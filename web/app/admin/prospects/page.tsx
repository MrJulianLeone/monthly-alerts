import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { outreachConfigured } from "@/lib/outreach";
import { requireOnboardedUser } from "@/lib/page-auth";
import {
  countByStatus,
  effectiveDailyCap,
  getSettings,
  sendsSince,
  type Prospect,
} from "@/lib/prospecting";
import { RunNowButton, SettingsForm } from "./actions";

export const dynamic = "force-dynamic";

// Admin-only prospecting pipeline dashboard; not localized.

const ACTIVE = ["new", "researched", "scored", "pending_approval", "approved", "sent", "followed_up"];

const STATUS_LABEL: Record<string, string> = {
  new: "queued for research",
  no_website: "no website",
  no_email: "no email",
  researched: "researched",
  scored: "scored",
  rejected_fit: "rejected (fit)",
  pending_approval: "needs approval",
  approved: "in send queue",
  sent: "sent",
  followed_up: "followed up",
  replied: "replied",
  converted: "converted",
  bounced: "bounced",
  suppressed: "suppressed",
  snoozed: "snoozed",
  closed: "closed",
};

export default async function ProspectsPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { user } = await requireOnboardedUser("/admin/prospects");
  if (!isAdmin(user)) notFound();

  const { status: statusFilter } = await props.searchParams;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [settings, counts, sentToday, queue, recent] = await Promise.all([
    getSettings(),
    countByStatus(),
    sendsSince(startOfDay),
    sql()`
      SELECT p.*,
             (SELECT count(*) FROM prospect_visits v WHERE v.prospect_id = p.id)::int AS visit_count
      FROM prospects p WHERE p.status = 'pending_approval'
      ORDER BY p.score DESC NULLS LAST, p.created_at LIMIT 25
    ` as unknown as Promise<Prospect[]>,
    sql()`
      SELECT p.*,
             (SELECT count(*) FROM prospect_visits v WHERE v.prospect_id = p.id)::int AS visit_count
      FROM prospects p
      WHERE ${statusFilter ?? null}::text IS NULL OR p.status = ${statusFilter ?? null}
      ORDER BY p.updated_at DESC LIMIT 100
    ` as unknown as Promise<Prospect[]>,
  ]);

  const cap = effectiveDailyCap(settings);
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const active = ACTIVE.reduce((a, s) => a + (counts[s] ?? 0), 0);

  const stat = (label: string, value: string | number, accent = false) => (
    <div className="bg-sheet p-6">
      <p className="microlabel mb-2">{label}</p>
      <p className={`display text-4xl ${accent ? "text-accent-deep" : ""}`}>{value}</p>
    </div>
  );

  const filterChip = (s: string | null, label: string) => (
    <Link
      key={label}
      href={s ? `/admin/prospects?status=${s}` : "/admin/prospects"}
      className={`chip ${statusFilter === s || (!statusFilter && !s) ? "text-ink" : "text-ink-faint hover:text-ink"}`}
    >
      {label}
      {s ? ` ${counts[s] ?? 0}` : ` ${total}`}
    </Link>
  );

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / Prospecting"}
        </p>
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <h1 className="display text-5xl">Prospects</h1>
          <div className="flex gap-2">
            <Link href="/admin/prospects/import" className="btn btn-ghost btn-sm">Import</Link>
            <Link href="/admin/prospects/setup" className="btn btn-ghost btn-sm">Gmail setup</Link>
          </div>
        </div>

        {!outreachConfigured() && (
          <p className="text-sm mb-6 border-[1.5px] border-accent-deep text-accent-deep px-4 py-3">
            The outreach mailbox isn&apos;t connected yet — emails will queue but nothing sends.{" "}
            <Link href="/admin/prospects/setup" className="underline">Finish the Gmail setup</Link>.
          </p>
        )}
        {settings.paused && (
          <p className="text-sm mb-6 border-[1.5px] border-accent-deep text-accent-deep px-4 py-3">
            Sending is paused. Resume it in the settings below once you&apos;ve reviewed why.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-strong border-[1.5px] border-line-strong mb-6">
          {stat("Awaiting approval", counts["pending_approval"] ?? 0, (counts["pending_approval"] ?? 0) > 0)}
          {stat("Sent today", `${sentToday}/${cap}`)}
          {stat("Replied", counts["replied"] ?? 0, (counts["replied"] ?? 0) > 0)}
          {stat("Converted", counts["converted"] ?? 0)}
        </div>

        <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
          <RunNowButton />
          <p className="microlabel">
            {active} active · {counts["bounced"] ?? 0} bounced · {counts["suppressed"] ?? 0} suppressed
          </p>
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">
          Approval queue <span className="text-ink-faint">{counts["pending_approval"] ?? 0}</span>
        </h2>
        {queue.length === 0 ? (
          <p className="text-sm text-ink-faint mb-10">
            Nothing waiting. New drafts appear here after the daily run researches, scores, and
            writes emails for imported prospects.
          </p>
        ) : (
          <div className="divide-y divide-line border-y-[1.5px] border-line-strong mb-10">
            {queue.map((p) => (
              <Link
                key={p.id}
                href={`/admin/prospects/${p.id}`}
                className="block py-3 hover:bg-sheet px-2 -mx-2"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold truncate">
                    {p.company}
                    <span className="chip text-accent-deep ml-2">score {p.score ?? "—"}</span>
                    {p.city && <span className="text-ink-faint font-normal ml-2">{p.city}{p.region ? `, ${p.region}` : ""}</span>}
                  </p>
                  <p className="microlabel shrink-0">{p.email}</p>
                </div>
                <p className="text-sm text-ink-soft truncate mt-0.5">
                  {p.draft_subject ?? "(no subject)"} — {(p.draft_body ?? "").slice(0, 120)}
                </p>
              </Link>
            ))}
          </div>
        )}

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Pipeline</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          {filterChip(null, "All")}
          {["pending_approval", "approved", "sent", "followed_up", "replied", "converted", "new", "no_website", "no_email", "rejected_fit", "bounced", "suppressed", "snoozed"].map((s) =>
            filterChip(s, STATUS_LABEL[s] ?? s)
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-faint mb-10">
            No prospects{statusFilter ? " with this status" : " yet — start with an import"}.
          </p>
        ) : (
          <div className="overflow-x-auto mb-10">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Company", "Status", "Score", "Email", "Visits", "Reply", "Updated"].map((h) => (
                    <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-4">
                      <Link href={`/admin/prospects/${p.id}`} className="font-medium hover:text-accent-deep">
                        {p.company}
                      </Link>
                      {p.city && <span className="text-ink-faint ml-2 text-xs">{p.city}</span>}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="chip text-ink-soft">{STATUS_LABEL[p.status] ?? p.status}</span>
                    </td>
                    <td className="py-2.5 pr-4">{p.score ?? "—"}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{p.email ?? "—"}</td>
                    <td className="py-2.5 pr-4">{p.visit_count && p.visit_count > 0 ? p.visit_count : "—"}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{p.reply_class ?? "—"}</td>
                    <td className="py-2.5 text-ink-soft">{fmt.format(new Date(p.updated_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Settings</h2>
        <SettingsForm
          paused={settings.paused}
          daily_cap={settings.daily_cap}
          score_threshold={settings.score_threshold}
          followup_days={settings.followup_days}
          snooze_months={settings.snooze_months}
          target_notes={settings.target_notes}
        />
        <p className="microlabel mt-3">
          Effective cap today: {cap} (warm-up ramp{settings.warmup_started_at ? ` since ${fmt.format(new Date(settings.warmup_started_at))}` : " not started"}).
          Daily run also fires automatically via cron.
        </p>
      </main>
    </div>
  );
}
