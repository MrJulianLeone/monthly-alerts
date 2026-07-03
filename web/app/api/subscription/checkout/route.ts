import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { stripe } from "@/lib/stripe";
import { appUrl } from "@/lib/email";

/**
 * Creates a Stripe Checkout Session for the monthly subscription.
 * Requires STRIPE_PRICE_ID (a recurring monthly price) in the environment.
 * Parents pay for their children; the checkout is tied to the coached user.
 * Body: { childId? } — parents pass the child account to subscribe for.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) return jsonError("Billing is not configured (missing STRIPE_PRICE_ID)", 503);

  const body = await request.json().catch(() => ({}));

  // Resolve which coached user this subscription covers.
  let subjectId = auth.user.id;
  if (body.childId) {
    const child = (await sql()`
      SELECT id FROM users WHERE id = ${body.childId} AND parent_id = ${auth.user.id}
    `) as { id: string }[];
    if (child.length === 0) return jsonError("Child account not found", 404);
    subjectId = child[0].id;
  }

  const subRows = (await sql()`
    SELECT id, stripe_customer_id, status FROM subscriptions WHERE user_id = ${subjectId}
  `) as { id: string; stripe_customer_id: string | null; status: string }[];
  if (subRows[0]?.status === "active") return jsonError("Subscription is already active", 409);

  let customerId = subRows[0]?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe().customers.create({
      email: auth.user.email,
      metadata: { user_id: subjectId, payer_user_id: auth.user.id },
    });
    customerId = customer.id;
    await sql()`
      UPDATE subscriptions SET stripe_customer_id = ${customerId}
      WHERE user_id = ${subjectId}
    `;
  }

  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/subscribe/success`,
    cancel_url: `${appUrl()}/subscribe`,
    metadata: { user_id: subjectId },
    subscription_data: { metadata: { user_id: subjectId } },
  });

  return NextResponse.json({ url: session.url });
}
