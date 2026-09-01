import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";

// Data layer for the prospecting pipeline. See the prospects comment in
// db/schema.sql for the state machine; lib/prospect-pipeline.ts advances it.

export type ProspectStatus =
  | "new"
  | "no_website"
  | "no_email"
  | "researched"
  | "scored"
  | "rejected_fit"
  | "pending_approval"
  | "approved"
  | "sent"
  | "followed_up"
  | "replied"
  | "converted"
  | "bounced"
  | "suppressed"
  | "snoozed"
  | "closed";

export type Prospect = {
  id: string;
  source: string;
  company: string;
  contact_name: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  region: string | null;
  license_no: string | null;
  classification: string | null;
  license_issued: string | null;
  status: ProspectStatus;
  status_note: string | null;
  research: string | null;
  score: number | null;
  score_reason: string | null;
  draft_subject: string | null;
  draft_body: string | null;
  followup_subject: string | null;
  followup_body: string | null;
  visit_token: string | null;
  reply_class: string | null;
  resume_at: string | null;
  approved_at: string | null;
  sent_at: string | null;
  followup_sent_at: string | null;
  replied_at: string | null;
  converted_at: string | null;
  gmail_thread_id: string | null;
  created_at: string;
  updated_at: string;
  visit_count?: number;
};

export type ProspectEmail = {
  id: string;
  prospect_id: string;
  direction: "outbound" | "inbound";
  kind: "initial" | "follow_up" | "reply" | "bounce";
  subject: string | null;
  body_text: string | null;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  message_id_header: string | null;
  ai_class: string | null;
  ai_note: string | null;
  created_at: string;
};

export type ProspectingSettings = {
  paused: boolean;
  daily_cap: number;
  score_threshold: number;
  followup_days: number;
  snooze_months: number;
  target_notes: string | null;
  warmup_started_at: string | null;
  last_poll_at: string | null;
};

export async function getSettings(): Promise<ProspectingSettings> {
  const rows = (await sql()`
    SELECT paused, daily_cap, score_threshold, followup_days, snooze_months,
           target_notes, warmup_started_at, last_poll_at
    FROM prospecting_settings WHERE id
  `) as ProspectingSettings[];
  if (rows.length === 0) {
    await sql()`INSERT INTO prospecting_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING`;
    return getSettings();
  }
  return rows[0];
}

export async function getProspect(id: string): Promise<Prospect | null> {
  const rows = (await sql()`
    SELECT p.*,
           (SELECT count(*) FROM prospect_visits v WHERE v.prospect_id = p.id)::int AS visit_count
    FROM prospects p WHERE p.id = ${id}
  `) as Prospect[];
  return rows[0] ?? null;
}

export async function listEmails(prospectId: string): Promise<ProspectEmail[]> {
  return (await sql()`
    SELECT * FROM prospect_emails WHERE prospect_id = ${prospectId} ORDER BY created_at
  `) as ProspectEmail[];
}

export async function setStatus(
  id: string,
  status: ProspectStatus,
  note?: string | null
): Promise<void> {
  await sql()`
    UPDATE prospects
    SET status = ${status}, status_note = ${note ?? null}, updated_at = now()
    WHERE id = ${id}
  `;
}

export async function isSuppressed(email: string): Promise<boolean> {
  const rows = (await sql()`
    SELECT 1 FROM prospect_suppressions WHERE email = ${email.toLowerCase()}
  `) as unknown[];
  return rows.length > 0;
}

export async function suppress(email: string, reason: string): Promise<void> {
  await sql()`
    INSERT INTO prospect_suppressions (email, reason) VALUES (${email.toLowerCase()}, ${reason})
    ON CONFLICT (email) DO NOTHING
  `;
}

export function newVisitToken(): string {
  return randomBytes(6).toString("base64url");
}

/**
 * Creates a prospect unless it duplicates an existing prospect (same email,
 * or same company+region), a suppressed address, or an existing user's email
 * domain. Returns the id, or null with a reason when skipped.
 */
export async function createProspect(input: {
  source: string;
  company: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  region?: string | null;
  license_no?: string | null;
  classification?: string | null;
  license_issued?: string | null;
  contact_name?: string | null;
}): Promise<{ id: string } | { skipped: string }> {
  const email = input.email?.trim().toLowerCase() || null;
  const company = input.company.trim();
  if (!company) return { skipped: "empty company" };

  if (email) {
    if (await isSuppressed(email)) return { skipped: "suppressed" };
    const existingUser = (await sql()`
      SELECT 1 FROM users WHERE lower(email) = ${email} AND deleted_at IS NULL
    `) as unknown[];
    if (existingUser.length > 0) return { skipped: "already a user" };
    const dupe = (await sql()`SELECT 1 FROM prospects WHERE email = ${email}`) as unknown[];
    if (dupe.length > 0) return { skipped: "duplicate email" };
  }
  const dupeCompany = (await sql()`
    SELECT 1 FROM prospects
    WHERE lower(company) = ${company.toLowerCase()}
      AND COALESCE(lower(region), '') = ${(input.region ?? "").toLowerCase()}
  `) as unknown[];
  if (dupeCompany.length > 0) return { skipped: "duplicate company" };

  const rows = (await sql()`
    INSERT INTO prospects (source, company, website, email, phone, city, region,
                           license_no, classification, license_issued, contact_name, visit_token)
    VALUES (${input.source}, ${company}, ${input.website ?? null}, ${email},
            ${input.phone ?? null}, ${input.city ?? null}, ${input.region ?? null},
            ${input.license_no ?? null}, ${input.classification ?? null},
            ${input.license_issued ?? null}, ${input.contact_name ?? null},
            ${newVisitToken()})
    RETURNING id
  `) as { id: string }[];
  return { id: rows[0].id };
}

/** Outbound sends (initial + follow-up) since the given time — cap math. */
export async function sendsSince(since: Date): Promise<number> {
  const rows = (await sql()`
    SELECT count(*)::int AS n FROM prospect_emails
    WHERE direction = 'outbound' AND created_at >= ${since.toISOString()}
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/**
 * Warm-up ramp: a fresh mailbox must not jump straight to the configured
 * cap. Week 1: 5/day, week 2: 8, week 3: 12, then the configured cap.
 */
export function effectiveDailyCap(s: ProspectingSettings): number {
  if (s.paused) return 0;
  if (!s.warmup_started_at) return Math.min(s.daily_cap, 5);
  const days = (Date.now() - new Date(s.warmup_started_at).getTime()) / 86_400_000;
  const ramp = days < 7 ? 5 : days < 14 ? 8 : days < 21 ? 12 : Infinity;
  return Math.min(s.daily_cap, ramp === Infinity ? s.daily_cap : ramp);
}

/**
 * Bounce circuit breaker: with at least 15 sends in the last 7 days, a
 * bounce rate over 5% pauses the pipeline (deliverability protection).
 */
export async function bounceRateExceeded(): Promise<boolean> {
  const rows = (await sql()`
    SELECT
      count(*) FILTER (WHERE direction = 'outbound')::int AS sends,
      count(*) FILTER (WHERE kind = 'bounce')::int AS bounces
    FROM prospect_emails WHERE created_at >= now() - interval '7 days'
  `) as { sends: number; bounces: number }[];
  const { sends, bounces } = rows[0] ?? { sends: 0, bounces: 0 };
  return sends >= 15 && bounces / sends > 0.05;
}

export type PipelineCounts = Record<string, number>;

export async function countByStatus(): Promise<PipelineCounts> {
  const rows = (await sql()`
    SELECT status, count(*)::int AS n FROM prospects GROUP BY status
  `) as { status: string; n: number }[];
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}
