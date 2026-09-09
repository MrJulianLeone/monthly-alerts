import Stripe from "stripe";
import { sql } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth";
import { sendInviteEmail } from "@/lib/email";
import type { Lang } from "@/lib/i18n";
import { grantReferralCredit } from "@/lib/referrals";

export {
  PROJECT_PRICE_CENTS,
  PROJECT_PRICE_DISPLAY,
  EXTENSION_YEARS,
  EXTENSION_PRICE_DISPLAY,
  DRAFT_DAYS,
} from "@/lib/pricing";

/**
 * Per-project one-time fee, off by default. "Owner" is a per-project role, not
 * an account type: any user (including someone who joined as an invitee on
 * another project) becomes an owner by creating a project of their own.
 *
 * With BILLING_ENABLED=true a new project starts as a free DRAFT: the owner
 * builds the checklist, previews it in every language and previews the
 * monthly report, then activates it (Stripe Checkout, or credits). Drafts
 * can't invite members (invites are held and sent on activation), don't get
 * monthly reports, and are deleted DRAFT_DAYS after creation if never
 * activated.
 */
export function billingEnabled(): boolean {
  return (
    process.env.BILLING_ENABLED === "true" &&
    !!process.env.STRIPE_SECRET_KEY &&
    !!process.env.STRIPE_PRICE_ID
  );
}

/** Extensions are sellable once the extension price exists in Stripe. */
export function extensionsEnabled(): boolean {
  return billingEnabled() && !!process.env.STRIPE_EXTENSION_PRICE_ID;
}

/** A project that has been created but not yet activated (billing on). */
export function isDraft(project: { paid_at: string | null; draft_expires_at: string | null }): boolean {
  return !project.paid_at && !!project.draft_expires_at;
}

export function draftDaysLeft(project: { draft_expires_at: string | null }): number {
  if (!project.draft_expires_at) return 0;
  const ms = new Date(project.draft_expires_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}

/**
 * Activates a draft: stamps paid_at, clears the draft deadline, credits the
 * referrer, and sends any invites the owner queued while drafting. Idempotent
 * — returns false if the project was already active.
 */
export async function activateProject(
  projectId: string,
  opts: { source: "stripe" | "credit" | "comp"; sessionId?: string | null; amountCents?: number | null }
): Promise<boolean> {
  const rows = (await sql()`
    UPDATE projects
    SET paid_at = now(), draft_expires_at = NULL, draft_warned_at = NULL,
        activation_source = ${opts.source},
        stripe_session_id = COALESCE(${opts.sessionId ?? null}, stripe_session_id),
        amount_paid_cents = ${opts.amountCents ?? 0}
    WHERE id = ${projectId} AND paid_at IS NULL
    RETURNING id
  `) as { id: string }[];
  if (rows.length === 0) return false;

  try {
    await grantReferralCredit(projectId);
  } catch (err) {
    console.error(`referral credit for ${projectId} failed:`, err);
  }
  try {
    await releaseHeldInvites(projectId);
  } catch (err) {
    console.error(`releasing held invites for ${projectId} failed:`, err);
  }
  return true;
}

/** Sends invites that were created while the project was a draft. */
async function releaseHeldInvites(projectId: string): Promise<void> {
  const held = (await sql()`
    SELECT i.id, i.email, i.role, i.language, u.name AS inviter_name, u.email AS inviter_email,
           p.name AS project_name
    FROM invites i
    JOIN users u ON u.id = i.invited_by
    JOIN projects p ON p.id = i.project_id
    WHERE i.project_id = ${projectId} AND i.held = true AND i.accepted_at IS NULL
  `) as {
    id: string;
    email: string;
    role: "editor" | "commenter";
    language: Lang;
    inviter_name: string | null;
    inviter_email: string;
    project_name: string;
  }[];
  for (const inv of held) {
    // The original token was only ever hashed, so issue a fresh one.
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    await sql()`
      UPDATE invites SET token_hash = ${hashToken(token)}, expires_at = ${expiresAt.toISOString()}, held = false
      WHERE id = ${inv.id}
    `;
    await sendInviteEmail(
      inv.email,
      inv.inviter_name ?? inv.inviter_email,
      inv.project_name,
      inv.role,
      token,
      inv.language
    );
  }
}

/**
 * Activates the draft named in a completed Checkout session. Idempotent on
 * stripe_session_id — called from both the webhook and the success page, so
 * whichever arrives first wins and the other is a no-op.
 */
export async function activateProjectFromSession(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const meta = session.metadata ?? {};
  if (!meta.activate_project_id) return null;
  const projectId = meta.activate_project_id;

  const owned = (await sql()`
    SELECT id FROM projects WHERE id = ${projectId} AND owner_id = ${meta.user_id ?? ""}
  `) as { id: string }[];
  if (owned.length === 0) return null;

  await activateProject(projectId, {
    source: "stripe",
    sessionId: session.id,
    amountCents: session.amount_total ?? null,
  });
  return projectId;
}

/**
 * Legacy path: sessions created before drafts existed carried the project
 * details in metadata and the project was created on payment. Kept so an
 * in-flight checkout from the old flow still lands. Idempotent on
 * stripe_session_id.
 */
export async function createProjectFromSession(
  session: Stripe.Checkout.Session
): Promise<string | null> {
  const meta = session.metadata ?? {};
  if (!meta.user_id || !meta.name) return null;

  const existing = (await sql()`
    SELECT id FROM projects WHERE stripe_session_id = ${session.id}
  `) as { id: string }[];
  if (existing.length > 0) return existing[0].id;

  const rows = (await sql()`
    INSERT INTO projects (name, name_lang, address, description, owner_id, paid_at,
                          stripe_session_id, amount_paid_cents, activation_source)
    VALUES (${meta.name}, ${meta.name_lang ?? "en"}, ${meta.address || null},
            ${meta.description || null}, ${meta.user_id}, now(), ${session.id},
            ${session.amount_total ?? null}, 'stripe')
    RETURNING id
  `) as { id: string }[];
  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${rows[0].id}, ${meta.user_id}, 'owner')
    ON CONFLICT DO NOTHING
  `;
  return rows[0].id;
}

/**
 * Applies a paid storage extension for a completed Checkout session.
 * Idempotent on stripe_session_id — called from both the webhook and the
 * success page. Re-arms the 30-day expiry warning for the new expiry date.
 */
export async function applyExtensionFromSession(
  session: Stripe.Checkout.Session
): Promise<boolean> {
  const meta = session.metadata ?? {};
  if (!meta.extend_project_id) return false;
  const years = Number(meta.years) || 2;

  const inserted = (await sql()`
    INSERT INTO project_extensions
      (project_id, stripe_session_id, amount_paid_cents, years, purchased_by)
    VALUES (${meta.extend_project_id}, ${session.id}, ${session.amount_total ?? null},
            ${years}, ${meta.user_id ?? null})
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING id
  `) as { id: string }[];
  if (inserted.length === 0) return true; // already applied

  await sql()`
    UPDATE projects
    SET extended_years = extended_years + ${years}, expiry_warned_at = NULL
    WHERE id = ${meta.extend_project_id}
  `;
  return true;
}
