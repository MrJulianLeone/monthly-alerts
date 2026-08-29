import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { EXTENSION_YEARS, extensionsEnabled, stripe } from "@/lib/billing";
import { appUrl } from "@/lib/email";

/**
 * Starts a Stripe Checkout for a storage extension (+EXTENSION_YEARS on the
 * project's retention). Owner-only; applied by the Stripe webhook with a
 * success-page fallback, mirroring project creation.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  if (!extensionsEnabled()) return jsonError("Extensions are not available", 503);

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_EXTENSION_PRICE_ID!, quantity: 1 }],
    automatic_tax: { enabled: true },
    billing_address_collection: "required",
    allow_promotion_codes: true,
    customer_email: auth.user.email,
    success_url: `${appUrl()}/projects/${id}/extended?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/projects/${id}/settings`,
    metadata: {
      extend_project_id: id,
      user_id: auth.user.id,
      years: String(EXTENSION_YEARS),
    },
  });
  return NextResponse.json({ checkout_url: session.url });
}
