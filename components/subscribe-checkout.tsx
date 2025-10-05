"use client"

import { useCallback, useEffect, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createSubscriptionCheckout } from "@/app/actions/subscription"

// Get the publishable key from environment
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export function SubscribeCheckout({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!stripePublishableKey) {
      setError("Stripe configuration is missing. Please contact support.")
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set")
      return
    }
    setStripePromise(loadStripe(stripePublishableKey))
  }, [])

  const startCheckout = useCallback(async () => {
    try {
      console.log("[Checkout] Starting checkout for user:", userId, userEmail)
      const clientSecret = await createSubscriptionCheckout(userId, userEmail)
      console.log("[Checkout] Got client secret")
      return clientSecret
    } catch (error) {
      console.error("[Checkout] Error creating checkout:", error)
      setError("Failed to initialize checkout. Please try again.")
      throw error
    }
  }, [userId, userEmail])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <p className="text-sm text-muted-foreground">
          If this problem persists, please contact support at support@monthlyalerts.com
        </p>
      </div>
    )
  }

  if (!stripePromise) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: startCheckout }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
