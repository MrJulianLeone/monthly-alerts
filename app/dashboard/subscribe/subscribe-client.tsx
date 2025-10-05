"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"
import { createCheckoutSession } from "@/app/actions/subscription"

export default function SubscribeClient({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    setLoading(true)
    setError(null)

    try {
      const checkoutUrl = await createCheckoutSession(userId, userEmail)
      
      if (checkoutUrl) {
        // Redirect to Stripe hosted checkout
        window.location.href = checkoutUrl
      } else {
        setError("Failed to create checkout session")
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Subscribe to MonthlyAlerts</h1>
            <p className="text-muted-foreground mb-2">
              Get monthly AI-curated alerts about fast-growing stock opportunities
            </p>
            <p className="text-3xl font-bold text-primary mb-6">$29<span className="text-lg font-normal">/month</span></p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Monthly AI-curated stock alerts</p>
                <p className="text-sm text-muted-foreground">Delivered directly to your inbox</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Secure payment via Stripe</p>
                <p className="text-sm text-muted-foreground">Your payment info is never stored on our servers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Cancel anytime</p>
                <p className="text-sm text-muted-foreground">No long-term commitment required</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {loading ? "Redirecting to Checkout..." : "Continue to Secure Checkout"}
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You&apos;ll be redirected to Stripe&apos;s secure checkout page
          </p>
        </Card>
      </div>
    </div>
  )
}
