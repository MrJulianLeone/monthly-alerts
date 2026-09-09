/**
 * Prices and program constants shown on public pages and used in credit math.
 * The amount actually charged is always the Stripe price; keep these in sync.
 */

/** One-time per-project fee. */
export const PROJECT_PRICE_CENTS = 10000;
export const PROJECT_PRICE_DISPLAY = "$100";

/** Storage extension: one purchase adds this many years for this price. */
export const EXTENSION_YEARS = 2;
export const EXTENSION_PRICE_DISPLAY = "$100";

/**
 * Try-before-you-pay: with billing on, a new project is a free draft for
 * this many days — build the checklist, preview it in every language and
 * the monthly report, then activate. Unactivated drafts are deleted.
 */
export const DRAFT_DAYS = 30;

/**
 * Referral program: credit to the referrer for every project activated by
 * someone who arrived through their link (monthlyalerts.com/CODE). Credits
 * accumulate and redeem against the referrer's own projects once they cover
 * a full project fee.
 */
export const REFERRAL_CREDIT_CENTS = 2000;
export const REFERRAL_CREDIT_DISPLAY = "$20";

export function referralsEnabled(): boolean {
  return process.env.REFERRALS_ENABLED === "true";
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
