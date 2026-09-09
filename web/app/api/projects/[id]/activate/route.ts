import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { activateProject, billingEnabled, stripe } from "@/lib/billing";
import { appUrl } from "@/lib/email";
import { redeemCreditsForProject } from "@/lib/referrals";

/**
 * Activates a draft project. If the owner's credit balance (referral
 * credits or a comped project) covers the fee, the project activates
 * immediately; otherwise a Stripe Checkout URL is returned and the webhook
 * (with a success-page fallback) activates it on payment.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  if (!billingEnabled()) return jsonError("Billing is not enabled", 400);
  if (auth.project.paid_at) return NextResponse.json({ activated: true, already: true });

  if (await redeemCreditsForProject(auth.user.id, id)) {
    await activateProject(id, { source: "credit", amountCents: 0 });
    return NextResponse.json({ activated: true, source: "credit" });
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    // Stripe Tax (enabled in the dashboard) only applies when the session
    // asks for it; billing address is required for tax calculation.
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    customer_email: auth.user.email,
    success_url: `${appUrl()}/projects/activated?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/projects/${id}`,
    metadata: {
      activate_project_id: id,
      user_id: auth.user.id,
    },
  });
  return NextResponse.json({ checkout_url: session.url });
}
