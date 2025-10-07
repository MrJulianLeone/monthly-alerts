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
        try {
          const session = event.data.object as Stripe.Checkout.Session
          console.log("[Webhook] Processing checkout.session.completed")

          if (session.mode === "subscription") {
            const subscriptionId = session.subscription as string
            const customerId = session.customer as string
            const customerEmail = session.customer_details?.email

            console.log("[Webhook] Subscription ID:", subscriptionId)
            console.log("[Webhook] Customer ID:", customerId)
            console.log("[Webhook] Customer Email:", customerEmail)

            // Look up user by email (no Stripe API calls to avoid timeout)
            if (!customerEmail) {
              console.error("[Webhook] No customer email in session")
              return NextResponse.json({ error: "No customer email" }, { status: 400 })
            }

            console.log("[Webhook] Looking up user by email:", customerEmail)
            const userResult = await sql`
              SELECT id FROM users WHERE email = ${customerEmail} LIMIT 1
            `
            
            if (userResult.length === 0) {
              console.error("[Webhook] User not found for email:", customerEmail)
              return NextResponse.json({ error: "User not found" }, { status: 400 })
            }

            const userId = userResult[0].id
            console.log("[Webhook] Found user:", userId)

            // Create subscription record with basic info
            // Will be updated with full details by customer.subscription.updated event
            console.log("[Webhook] Creating subscription record...")
            const insertResult = await sql`
              INSERT INTO subscriptions (
                user_id, 
                stripe_customer_id, 
                stripe_subscription_id, 
                status
              )
              VALUES (
                ${userId}::uuid,
                ${customerId},
                ${subscriptionId},
                'active'
              )
              ON CONFLICT (stripe_subscription_id) 
              DO UPDATE SET
                status = 'active',
                stripe_customer_id = ${customerId},
                updated_at = NOW()
              RETURNING (xmax = 0) AS inserted
            `

            console.log("[Webhook] Subscription record created for user:", userId)

            // Send subscription confirmation email on new subscriptions
            const isNewSubscription = insertResult[0]?.inserted
            if (isNewSubscription) {
              console.log("[Webhook] Sending subscription confirmation email...")
              try {
                // Get user details
                const userDetails = await sql`
                  SELECT first_name, last_name, email FROM users WHERE id = ${userId}::uuid
                `
                
                if (userDetails.length > 0) {
                  const user = userDetails[0]
                  
                  // Import and send subscription confirmation email
                  const { sendSubscriptionEmail } = await import("@/app/actions/send-subscription-email")
                  await sendSubscriptionEmail(user.email, user.first_name, user.last_name)
                  
                  console.log("[Webhook] Subscription confirmation email sent to:", user.email)
                }
              } catch (emailError) {
                console.error("[Webhook] Failed to send subscription email:", emailError)
                // Don't fail the webhook if email fails
              }
            }
          }
        } catch (err: any) {
          console.error("[Webhook] Error processing checkout.session.completed:", err.message)
          console.error("[Webhook] Stack:", err.stack)
          throw err
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        // Don't update subscriptions for admin users
        await sql`
          UPDATE subscriptions
          SET 
            status = ${subscription.status},
            current_period_start = to_timestamp(${subscription.current_period_start}),
            current_period_end = to_timestamp(${subscription.current_period_end}),
            cancel_at_period_end = ${subscription.cancel_at_period_end || false},
            updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
            AND user_id NOT IN (SELECT user_id FROM admin_users)
        `

        console.log("[v0] Subscription updated:", subscription.id)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Don't update subscriptions for admin users
        await sql`
          UPDATE subscriptions
          SET 
            status = 'cancelled',
            updated_at = NOW()
          WHERE stripe_subscription_id = ${subscription.id}
            AND user_id NOT IN (SELECT user_id FROM admin_users)
        `

        console.log("[v0] Subscription cancelled:", subscription.id)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Don't update subscriptions for admin users
          await sql`
            UPDATE subscriptions
            SET 
              status = 'active',
              updated_at = NOW()
            WHERE stripe_subscription_id = ${invoice.subscription}
              AND user_id NOT IN (SELECT user_id FROM admin_users)
          `

          console.log("[v0] Payment succeeded for subscription:", invoice.subscription)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Don't update subscriptions for admin users
          await sql`
            UPDATE subscriptions
            SET 
              status = 'past_due',
              updated_at = NOW()
            WHERE stripe_subscription_id = ${invoice.subscription}
              AND user_id NOT IN (SELECT user_id FROM admin_users)
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
