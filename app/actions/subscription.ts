"use server"

import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function createSubscriptionCheckout(userId: string, userEmail: string) {
  try {
    console.log("[Subscription] Starting checkout for user:", userId, userEmail)
    console.log("[Subscription] NEXT_PUBLIC_URL:", process.env.NEXT_PUBLIC_URL)

    // Validate inputs
    if (!userId || !userEmail) {
      throw new Error("Missing userId or userEmail")
    }

    // Create or retrieve Stripe customer
    console.log("[Subscription] Looking for existing customer...")
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    let customer
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log("[Subscription] Found existing customer:", customer.id)
    } else {
      console.log("[Subscription] Creating new customer...")
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      })
      console.log("[Subscription] Created new customer:", customer.id)
    }

    // Create checkout session for subscription
    console.log("[Subscription] Creating checkout session...")
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "MonthlyAlerts Subscription",
              description: "Monthly AI-curated stock alerts",
            },
            unit_amount: 2900, // $29.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      return_url: `${process.env.NEXT_PUBLIC_URL || "https://monthlyalerts.com"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    })

    console.log("[Subscription] Created session:", checkoutSession.id)
    console.log("[Subscription] Client secret exists:", !!checkoutSession.client_secret)
    
    if (!checkoutSession.client_secret) {
      throw new Error("No client secret returned from Stripe")
    }

    return checkoutSession.client_secret
  } catch (error: any) {
    console.error("[Subscription] Error creating checkout:", error)
    console.error("[Subscription] Error details:", {
      message: error.message,
      type: error.type,
      code: error.code,
    })
    throw new Error(`Checkout failed: ${error.message}`)
  }
}

export async function cancelSubscription(formData: FormData) {
  const subscriptionId = formData.get("subscriptionId") as string

  if (!subscriptionId) {
    return { error: "Subscription ID is required" }
  }

  try {
    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update database
    await sql`
      UPDATE subscriptions 
      SET cancel_at_period_end = true, updated_at = NOW()
      WHERE stripe_subscription_id = ${subscriptionId}
    `

    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}
