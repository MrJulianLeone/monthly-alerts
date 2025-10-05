import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function SubscribePage() {
  const session = await getSession()
  if (!session) redirect("/login")

  // Stripe test payment link with pre-filled email
  const stripePaymentLink = `https://buy.stripe.com/test_4gMcN41Pr5TEe9Ogt6dAk00?prefilled_email=${encodeURIComponent(session.email)}`

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
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
            <p className="text-3xl font-bold text-primary mb-6">$29.99<span className="text-lg font-normal">/month + tax</span></p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Monthly AI-curated stock alerts</p>
                <p className="text-sm text-muted-foreground">Delivered directly to your inbox</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Secure payment via Stripe</p>
                <p className="text-sm text-muted-foreground">Your payment info is never stored on our servers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Cancel anytime</p>
                <p className="text-sm text-muted-foreground">No long-term commitment required</p>
              </div>
            </div>
          </div>

          <Link href={stripePaymentLink}>
            <Button size="lg" className="w-full">
              <CreditCard className="h-4 w-4 mr-2" />
              Continue to Secure Checkout
            </Button>
          </Link>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You&apos;ll be redirected to Stripe&apos;s secure checkout page
          </p>
        </Card>
      </div>
    </div>
  )
}