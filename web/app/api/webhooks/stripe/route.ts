import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createProjectFromSession, stripe } from "@/lib/billing";

/**
 * Creates the paid project when Stripe Checkout completes. Idempotent on
 * stripe_session_id, and mirrored by a fallback on the /projects/activated
 * success page in case the webhook is delayed.
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(
      await request.text(),
      signature,
      secret
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Async payment methods can complete the session before the money clears.
    if (session.payment_status === "paid") {
      await createProjectFromSession(session);
    }
  }

  return NextResponse.json({ received: true });
}
