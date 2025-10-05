import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { cancelSubscription } from "@/app/actions/subscription"

const sql = neon(process.env.DATABASE_URL!)

export default async function ManageSubscriptionPage() {
  const session = await requireAuth()

  // Fetch user subscription
  const subscriptions = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${session.user_id}::uuid
    ORDER BY created_at DESC
    LIMIT 1
  `

  const subscription = subscriptions[0]

  if (!subscription || subscription.status !== "active") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Subscription</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium">Monthly Subscription</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">$29/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next billing date</span>
                <span className="font-medium">
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-destructive/50">
            <div className="flex gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Cancel Subscription</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  If you cancel, you'll continue to have access until the end of your current billing period (
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : "N/A"}
                  ). You won't be charged again.
                </p>
              </div>
            </div>
            <form action={cancelSubscription}>
              <input type="hidden" name="subscriptionId" value={subscription.stripe_subscription_id} />
              <Button type="submit" variant="destructive">
                Cancel Subscription
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
