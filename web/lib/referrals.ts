import { sql } from "@/lib/db";
import { normalizeCode } from "@/lib/attribution";
import { PROJECT_PRICE_CENTS, REFERRAL_CREDIT_CENTS } from "@/lib/pricing";

/**
 * Referral program: every user can claim one code (monthlyalerts.com/CODE).
 * Visitors arriving through it are cookied; when a referred user activates a
 * project, the referrer earns REFERRAL_CREDIT_CENTS in the credit ledger.
 * Credits redeem automatically against the referrer's own projects once the
 * balance covers a full project fee. The same ledger holds comped projects
 * ("try your next project on us") granted by the admin or by outreach.
 */

/** Words that would make an embarrassing or misleading vanity URL. */
const RESERVED = new Set([
  "ADMIN",
  "API",
  "LOGIN",
  "LOGOUT",
  "SIGNUP",
  "DASHBOARD",
  "PROJECTS",
  "SETTINGS",
  "CONTACT",
  "TERMS",
  "PRIVACY",
  "GUIDES",
  "CHECKLISTS",
  "DEMO",
  "WELCOME",
  "FORGOT",
  "RESET",
  "UNSUBSCRIBE",
  "SUPPORT",
  "HELP",
  "PRICING",
  "ABOUT",
  "BLOG",
  "MONTHLYALERTS",
]);

export type ReferralCode = { code: string; user_id: string; created_at: string };

export async function getReferralCode(userId: string): Promise<ReferralCode | null> {
  const rows = (await sql()`
    SELECT code, user_id, created_at FROM referral_codes WHERE user_id = ${userId}
  `) as ReferralCode[];
  return rows[0] ?? null;
}

export async function findReferralCode(raw: string): Promise<ReferralCode | null> {
  const code = normalizeCode(raw);
  if (!code) return null;
  const rows = (await sql()`
    SELECT code, user_id, created_at FROM referral_codes WHERE code = ${code}
  `) as ReferralCode[];
  return rows[0] ?? null;
}

/** A default code from the user's name/company/email, e.g. ANDREALEONE. */
export function suggestCode(user: { name: string | null; company: string | null; email: string }): string {
  const base = (user.name || user.company || user.email.split("@")[0])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 20);
  return base.length >= 4 ? base : (base + "PROJECTS").slice(0, 20);
}

export type ClaimResult = { ok: true; code: string } | { ok: false; error: "invalid" | "taken" | "reserved" };

/** Claims (or renames to) a code for the user. */
export async function claimReferralCode(userId: string, raw: string): Promise<ClaimResult> {
  const code = normalizeCode(raw);
  if (!code) return { ok: false, error: "invalid" };
  if (RESERVED.has(code)) return { ok: false, error: "reserved" };
  const taken = (await sql()`
    SELECT user_id FROM referral_codes WHERE code = ${code}
  `) as { user_id: string }[];
  if (taken.length > 0 && taken[0].user_id !== userId) return { ok: false, error: "taken" };
  await sql()`
    INSERT INTO referral_codes (code, user_id) VALUES (${code}, ${userId})
    ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code
  `;
  return { ok: true, code };
}

export async function creditBalanceCents(userId: string): Promise<number> {
  const rows = (await sql()`
    SELECT COALESCE(sum(amount_cents), 0)::int AS balance FROM credit_ledger WHERE user_id = ${userId}
  `) as { balance: number }[];
  return rows[0]?.balance ?? 0;
}

export type LedgerRow = {
  id: string;
  amount_cents: number;
  reason: string;
  project_id: string | null;
  project_name: string | null;
  note: string | null;
  created_at: string;
};

export async function listLedger(userId: string): Promise<LedgerRow[]> {
  return (await sql()`
    SELECT l.id, l.amount_cents, l.reason, l.project_id, p.name AS project_name, l.note, l.created_at
    FROM credit_ledger l LEFT JOIN projects p ON p.id = l.project_id
    WHERE l.user_id = ${userId}
    ORDER BY l.created_at DESC
  `) as LedgerRow[];
}

/** Grants a comped project (admin or outreach). Idempotent per note when asked. */
export async function grantCredit(opts: {
  userId: string;
  amountCents: number;
  reason: "comp" | "referral";
  note?: string;
  createdBy?: string | null;
  projectId?: string | null;
}): Promise<void> {
  await sql()`
    INSERT INTO credit_ledger (user_id, amount_cents, reason, note, created_by, project_id)
    VALUES (${opts.userId}, ${opts.amountCents}, ${opts.reason}, ${opts.note ?? null},
            ${opts.createdBy ?? null}, ${opts.projectId ?? null})
  `;
}

/**
 * Credits the referrer for a newly activated project, once. Self-referrals
 * (a user activating their own project through their own link) earn nothing.
 */
export async function grantReferralCredit(projectId: string): Promise<boolean> {
  const rows = (await sql()`
    SELECT p.owner_id, r.user_id AS referrer_id
    FROM projects p JOIN referral_codes r ON r.code = p.referral_code
    WHERE p.id = ${projectId} AND p.paid_at IS NOT NULL
  `) as { owner_id: string; referrer_id: string }[];
  const row = rows[0];
  if (!row || row.referrer_id === row.owner_id) return false;
  const inserted = (await sql()`
    INSERT INTO credit_ledger (user_id, amount_cents, reason, project_id)
    VALUES (${row.referrer_id}, ${REFERRAL_CREDIT_CENTS}, 'referral', ${projectId})
    ON CONFLICT DO NOTHING
    RETURNING id
  `) as { id: string }[];
  return inserted.length > 0;
}

/**
 * Spends credits on a project if the balance covers the full fee. Returns
 * true when a redemption row was written (the caller then activates).
 */
export async function redeemCreditsForProject(userId: string, projectId: string): Promise<boolean> {
  const balance = await creditBalanceCents(userId);
  if (balance < PROJECT_PRICE_CENTS) return false;
  await sql()`
    INSERT INTO credit_ledger (user_id, amount_cents, reason, project_id, note)
    VALUES (${userId}, ${-PROJECT_PRICE_CENTS}, 'redeem', ${projectId}, 'Project activated with credits')
  `;
  return true;
}

export type ReferralStats = {
  signups: number;
  activated: number;
  earned_cents: number;
};

export async function referralStats(code: string): Promise<ReferralStats> {
  const rows = (await sql()`
    SELECT
      (SELECT count(*) FROM users u WHERE u.referred_by_code = ${code} AND u.deleted_at IS NULL)::int AS signups,
      (SELECT count(*) FROM projects p WHERE p.referral_code = ${code} AND p.paid_at IS NOT NULL)::int AS activated,
      (SELECT COALESCE(sum(l.amount_cents), 0) FROM credit_ledger l
         JOIN referral_codes r ON r.user_id = l.user_id
         WHERE r.code = ${code} AND l.reason = 'referral')::int AS earned_cents
  `) as ReferralStats[];
  return rows[0] ?? { signups: 0, activated: 0, earned_cents: 0 };
}
