import { cookies } from "next/headers";
import { sql } from "@/lib/db";

/**
 * First-touch acquisition attribution, kept in three cookies and snapshotted
 * onto the account at signup (users.acquisition / referred_by_code /
 * prospect_id) and onto each project at creation. Everything here is
 * best-effort: attribution must never block signup or project creation.
 */
export const REF_COOKIE = "ma_ref"; // referral code from monthlyalerts.com/CODE
export const ATTR_COOKIE = "ma_attr"; // JSON first-touch utm/landing snapshot (set client-side)
export const PROSPECT_COOKIE = "ma_prospect"; // outreach visit token from /w/<token>
export const ATTRIBUTION_DAYS = 90;

export type Acquisition = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  landing?: string;
  referrer?: string;
  ts?: string;
};

const ATTR_KEYS: (keyof Acquisition)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "landing",
  "referrer",
  "ts",
];

export const REFERRAL_CODE_RE = /^[A-Z0-9]{4,20}$/;

export function normalizeCode(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return REFERRAL_CODE_RE.test(code) ? code : null;
}

/** Parses the client-set attribution cookie, dropping anything unexpected. */
export function parseAcquisition(raw: string | undefined): Acquisition | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    const out: Acquisition = {};
    for (const key of ATTR_KEYS) {
      const v = parsed[key];
      if (typeof v === "string" && v.length > 0) out[key] = v.slice(0, 200);
    }
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

export type AttributionSnapshot = {
  referralCode: string | null; // validated against referral_codes
  acquisition: Acquisition | null;
  prospectId: string | null; // validated against prospects.visit_token
};

/** Reads and validates the attribution cookies for the current request. */
export async function readAttribution(): Promise<AttributionSnapshot> {
  const empty: AttributionSnapshot = { referralCode: null, acquisition: null, prospectId: null };
  try {
    const store = await cookies();
    const code = normalizeCode(store.get(REF_COOKIE)?.value);
    const acquisition = parseAcquisition(store.get(ATTR_COOKIE)?.value);
    const visitToken = store.get(PROSPECT_COOKIE)?.value ?? null;

    let referralCode: string | null = null;
    if (code) {
      const rows = (await sql()`SELECT code FROM referral_codes WHERE code = ${code}`) as {
        code: string;
      }[];
      referralCode = rows[0]?.code ?? null;
      if (referralCode && !acquisition) {
        // A referral link is itself the acquisition source.
        return { referralCode, acquisition: { utm_source: "referral", utm_medium: "link" }, prospectId: null };
      }
    }

    let prospectId: string | null = null;
    if (visitToken && /^[A-Za-z0-9_-]{6,64}$/.test(visitToken)) {
      const rows = (await sql()`
        SELECT id FROM prospects WHERE visit_token = ${visitToken}
      `) as { id: string }[];
      prospectId = rows[0]?.id ?? null;
    }
    return { referralCode, acquisition, prospectId };
  } catch (err) {
    console.error("attribution read failed:", err);
    return empty;
  }
}

/**
 * Channel bucket for CAC math, from a first-touch snapshot. Mirrors the
 * channel names used for marketing_spend rows.
 */
export function channelOf(
  acquisition: Acquisition | null | undefined,
  referralCode?: string | null,
  prospectId?: string | null
): string {
  if (referralCode) return "referral";
  if (prospectId) return "outreach";
  const src = (acquisition?.utm_source ?? "").toLowerCase();
  const medium = (acquisition?.utm_medium ?? "").toLowerCase();
  if (acquisition?.gclid || src === "google" || src === "adwords") return "google";
  if (acquisition?.fbclid || ["meta", "facebook", "instagram", "fb", "ig"].includes(src)) return "meta";
  if (src === "outreach") return "outreach";
  if (src === "referral") return "referral";
  if (medium === "social" || src === "youtube" || src === "tiktok") return "social";
  if (src) return "other";
  const landing = acquisition?.landing ?? "";
  if (landing.startsWith("/guides") || landing.startsWith("/checklists")) return "content";
  return "organic";
}
