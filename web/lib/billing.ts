import Stripe from "stripe";
import { sql } from "@/lib/db";

/**
 * Per-project one-time fee, off by default. "Owner" is a per-project role, not
 * an account type: any user (including someone who joined as an invitee on
 * another project) becomes an owner by creating — and, once billing is on,
 * paying for — a project of their own. Flipping BILLING_ENABLED=true routes
 * project creation through Stripe Checkout; no schema change needed.
 */
/** Shown on public pages; the amount actually charged is the Stripe price. */
export const PROJECT_PRICE_DISPLAY = "$100";

export function billingEnabled(): boolean {
  return (
    process.env.BILLING_ENABLED === "true" &&
    !!process.env.STRIPE_SECRET_KEY &&
    !!process.env.STRIPE_PRICE_ID
  );
}

let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}

/**
 * Creates the paid project for a completed Checkout session. Idempotent on
 * stripe_session_id — called from both the webhook and the success page, so
 * whichever arrives first wins and the other is a no-op.
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
                          stripe_session_id, amount_paid_cents)
    VALUES (${meta.name}, ${meta.name_lang ?? "en"}, ${meta.address || null},
            ${meta.description || null}, ${meta.user_id}, now(), ${session.id},
            ${session.amount_total ?? null})
    RETURNING id
  `) as { id: string }[];
  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${rows[0].id}, ${meta.user_id}, 'owner')
    ON CONFLICT DO NOTHING
  `;
  return rows[0].id;
}
