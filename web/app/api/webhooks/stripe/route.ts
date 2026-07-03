import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { sql } from "@/lib/db";
import { stripe } from "@/lib/stripe";

/** Stripe webhook: keeps the subscriptions table in sync. */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId && session.subscription) {
        await sql()`
          UPDATE subscriptions
          SET stripe_subscription_id = ${String(session.subscription)},
              stripe_customer_id = ${String(session.customer)},
              status = 'active', canceled_at = NULL
          WHERE user_id = ${userId}
        `;
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        sub.status === "active" || sub.status === "trialing"
          ? "active"
          : sub.status === "past_due" || sub.status === "unpaid"
            ? "past_due"
            : sub.status === "canceled"
              ? "canceled"
              : "incomplete";
      const periodEnd = sub.items.data[0]?.current_period_end;
      await sql()`
        UPDATE subscriptions
        SET status = ${status},
            current_period_end = ${periodEnd ? new Date(periodEnd * 1000).toISOString() : null},
            canceled_at = ${sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null}
        WHERE stripe_subscription_id = ${sub.id}
      `;
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await sql()`
        UPDATE subscriptions SET status = 'canceled', canceled_at = now()
        WHERE stripe_subscription_id = ${sub.id}
      `;
      break;
    }
  }

  return NextResponse.json({ received: true });
}
