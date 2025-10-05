"use server"

import { redirect } from "next/navigation"
import { stripe } from "@/lib/stripe"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function createSubscriptionCheckout(userId: string, userEmail: string) {
  // Create or retrieve Stripe customer
  let customer
  const existingCustomers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0]
  } else {
    customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
      },
    })
  }

  // Create checkout session for subscription
  const session = await stripe.checkout.sessions.create({
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
    return_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  })

  return session.client_secret
}

export async function cancelSubscription(formData: FormData) {
  const subscriptionId = formData.get("subscriptionId") as string

  if (!subscriptionId) {
    throw new Error("Subscription ID is required")
  }

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

  redirect("/dashboard")
}
