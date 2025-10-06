"use server"

import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function createCheckoutSession(userId: string, userEmail: string) {
  try {
    console.log("[Subscription] Starting checkout for user:", userId, userEmail)

    // Create or retrieve Stripe customer
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    let customer
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
      console.log("[Subscription] Found existing customer:", customer.id)
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId },
      })
      console.log("[Subscription] Created new customer:", customer.id)
    }

    // Create hosted checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "MonthlyAlerts Subscription",
              description: "Monthly AI-curated stock alerts",
            },
            unit_amount: 2999, // $29.99
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_URL || "https://monthlyalerts.com"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL || "https://monthlyalerts.com"}/dashboard?canceled=true`,
    })

    console.log("[Subscription] Created session:", session.id)
    return session.url // Return the hosted checkout URL
  } catch (error: any) {
    console.error("[Subscription] Error:", error)
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
    console.error("[CancelSubscription] Error:", error)
    return { error: error.message }
  }
}
