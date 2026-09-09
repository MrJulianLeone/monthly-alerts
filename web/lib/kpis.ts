import { channelOf, type Acquisition } from "@/lib/attribution";
import { sql } from "@/lib/db";

/** Channels the admin can record spend against (matches channelOf buckets). */
export const SPEND_CHANNELS = ["google", "meta", "outreach", "content", "partnerships", "other"] as const;
export type SpendChannel = (typeof SPEND_CHANNELS)[number];

/** Marketing-plan targets, shown next to actuals on /admin/kpis. */
export const KPI_TARGETS = {
  directCacMaxCents: 3500, // direct consumer CAC < $30–35
  referralCacMaxCents: 1500, // referral / organic CAC < $15
  blendedCacMaxCents: 3000, // blended CAC < $25–30
  professionalCacMaxCents: 15000, // professional acquisition < $150
  visitorToProjectMin: 0.08, // visitor → project creation > 8%
  projectToPaidMin: 0.2, // project creation → paid > 20%
  referralOrganicShareMin: 0.3, // by month 6
};

export type MonthRow = {
  month: string; // YYYY-MM
  signups: number;
  projects_created: number;
  activated: number;
  activated_paid: number; // Stripe (excludes credit/comp)
  revenue_cents: number;
  by_channel: Record<string, { created: number; activated: number }>;
  spend_cents: Record<string, number>;
  spend_total_cents: number;
};

type ProjectRow = {
  month: string;
  paid_month: string | null;
  paid_at: string | null;
  activation_source: string | null;
  amount_paid_cents: number | null;
  referral_code: string | null;
  acquisition: Acquisition | null;
  owner_prospect_id: string | null;
};

/** Monthly funnel for the last `months` months, newest first. */
export async function monthlyKpis(months = 6): Promise<MonthRow[]> {
  const [signups, projects, spend] = await Promise.all([
    sql()`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, count(*)::int AS n
      FROM users WHERE deleted_at IS NULL AND created_at >= date_trunc('month', now()) - make_interval(months => ${months - 1})
      GROUP BY 1
    ` as unknown as Promise<{ month: string; n: number }[]>,
    sql()`
      SELECT to_char(date_trunc('month', p.created_at), 'YYYY-MM') AS month,
             to_char(date_trunc('month', p.paid_at), 'YYYY-MM') AS paid_month,
             p.paid_at, p.activation_source, p.amount_paid_cents, p.referral_code,
             COALESCE(p.acquisition, u.acquisition) AS acquisition,
             u.prospect_id AS owner_prospect_id
      FROM projects p JOIN users u ON u.id = p.owner_id
      WHERE p.created_at >= date_trunc('month', now()) - make_interval(months => ${months - 1})
         OR p.paid_at >= date_trunc('month', now()) - make_interval(months => ${months - 1})
    ` as unknown as Promise<ProjectRow[]>,
    sql()`
      SELECT to_char(month, 'YYYY-MM') AS month, channel, amount_cents
      FROM marketing_spend
      WHERE month >= date_trunc('month', now()) - make_interval(months => ${months - 1})
    ` as unknown as Promise<{ month: string; channel: string; amount_cents: number }[]>,
  ]);

  const rows = new Map<string, MonthRow>();
  const now = new Date();
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    rows.set(key, {
      month: key,
      signups: 0,
      projects_created: 0,
      activated: 0,
      activated_paid: 0,
      revenue_cents: 0,
      by_channel: {},
      spend_cents: {},
      spend_total_cents: 0,
    });
  }
  const bump = (row: MonthRow, channel: string, field: "created" | "activated") => {
    row.by_channel[channel] ??= { created: 0, activated: 0 };
    row.by_channel[channel][field]++;
  };

  for (const s of signups) if (rows.has(s.month)) rows.get(s.month)!.signups = s.n;
  for (const p of projects) {
    const channel = channelOf(p.acquisition, p.referral_code, p.owner_prospect_id);
    const created = rows.get(p.month);
    if (created) {
      created.projects_created++;
      bump(created, channel, "created");
    }
    if (p.paid_month && rows.has(p.paid_month)) {
      const paid = rows.get(p.paid_month)!;
      paid.activated++;
      if (p.activation_source === "stripe" || (!p.activation_source && p.amount_paid_cents)) {
        paid.activated_paid++;
      }
      paid.revenue_cents += p.amount_paid_cents ?? 0;
      bump(paid, channel, "activated");
    }
  }
  for (const s of spend) {
    const row = rows.get(s.month);
    if (!row) continue;
    row.spend_cents[s.channel] = s.amount_cents;
    row.spend_total_cents += s.amount_cents;
  }
  return [...rows.values()];
}

export type ReferralReport = {
  code: string;
  email: string;
  name: string | null;
  signups: number;
  created: number;
  activated: number;
  earned_cents: number;
  redeemed_cents: number;
};

export async function referralReport(): Promise<ReferralReport[]> {
  return (await sql()`
    SELECT r.code, u.email, u.name,
      (SELECT count(*) FROM users x WHERE x.referred_by_code = r.code AND x.deleted_at IS NULL)::int AS signups,
      (SELECT count(*) FROM projects p WHERE p.referral_code = r.code)::int AS created,
      (SELECT count(*) FROM projects p WHERE p.referral_code = r.code AND p.paid_at IS NOT NULL)::int AS activated,
      (SELECT COALESCE(sum(amount_cents), 0) FROM credit_ledger l WHERE l.user_id = r.user_id AND l.reason = 'referral')::int AS earned_cents,
      (SELECT COALESCE(-sum(amount_cents), 0) FROM credit_ledger l WHERE l.user_id = r.user_id AND l.reason = 'redeem')::int AS redeemed_cents
    FROM referral_codes r JOIN users u ON u.id = r.user_id
    ORDER BY activated DESC, signups DESC, r.created_at
  `) as ReferralReport[];
}
