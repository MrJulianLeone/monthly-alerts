import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"
import type Stripe from "stripe"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error("[v0] Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log("[v0] Received Stripe webhook event:", event.type)

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const customerEmail = session.customer_details?.email

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Get customer to find user_id from metadata
          const customer = await stripe.customers.retrieve(customerId)
          let userId = (customer as Stripe.Customer).metadata?.userId

          // If no userId in metadata (e.g., payment link), look up by email
          if (!userId && customerEmail) {
            console.log("[v0] No userId in metadata, looking up by email:", customerEmail)
            const userResult = await sql`
              SELECT id FROM users WHERE email = ${customerEmail} LIMIT 1
            `
            if (userResult.length > 0) {
              userId = userResult[0].id
              console.log("[v0] Found user by email:", userId)
            }
          }

          if (!userId) {
            console.error("[v0] Could not find userId for customer:", customerId, customerEmail)
            break
          }

          // Create or update subscription in database
          await sql`
            INSERT INTO subscriptions (
              user_id, 
              stripe_customer_id, 
              stripe_subscription_id, 
              stripe_price_id,
              status, 
              current_period_start, 
              current_period_end
            )
            VALUES (
              ${userId}::uuid,
              ${customerId},
              ${subscriptionId},
              ${subscription.items.data[0].price.id},
              ${subscription.status},
              to_timestamp(${subscription.current_period_start}),
              to_timestamp(${subscription.current_period_end})
            )
            ON CONFLICT (stripe_subscription_id) 
            DO UPDATE SET
              status = ${subscription.status},
              current_period_start = to_timestamp(${subscription.current_period_start}),
              current_period_end = to_timestamp(${subscription.current_period_end}),
              updated_at = NOW()
          `

          console.log("[v0] Subscription created/updated for user:", userId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        await sql`
          UPDATE subscriptions
          SET 
            status = ${subscription.status},
            current_period_start = to_timestamp(${subscription.current_period_start}),
            current_period_end = to_timestamp(${subscription.current_period_end}),
            cancel_at_period_end = ${subscription.cancel_at_period_end || false},
            updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
        `

        console.log("[v0] Subscription updated:", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        await sql`
          UPDATE subscriptions
          SET 
            status = 'cancelled',
            updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
        `

        console.log("[v0] Subscription cancelled:", subscription.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          await sql`
            UPDATE subscriptions
            SET 
              status = 'active',
              updated_at = NOW()
            WHERE stripe_subscription_id = ${invoice.subscription}
          `

          console.log("[v0] Payment succeeded for subscription:", invoice.subscription)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          await sql`
            UPDATE subscriptions
            SET 
              status = 'past_due',
              updated_at = NOW()
            WHERE stripe_subscription_id = ${invoice.subscription}
          `

          console.log("[v0] Payment failed for subscription:", invoice.subscription)
        }
        break
      }

      default:
        console.log("[v0] Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
