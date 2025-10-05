import { requireAuth } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SubscribeCheckout } from "@/components/subscribe-checkout"

export default async function SubscribePage() {
  const session = await requireAuth()

  // Log session for debugging (will appear in Vercel logs)
  console.log("[Subscribe Page] Session data:", {
    has_user_id: !!session.user_id,
    has_email: !!session.email,
    user_id_type: typeof session.user_id,
    email: session.email
  })

  // Ensure we have required session data
  if (!session.user_id || !session.email) {
    console.error("[Subscribe Page] Missing session data:", session)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4">Session Error</h2>
          <p className="text-muted-foreground mb-4">
            Your session is missing required information. Please try logging out and logging in again.
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MonthlyAlerts.com</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Subscribe to MonthlyAlerts</h1>
            <p className="text-muted-foreground">Get AI-curated stock alerts delivered monthly</p>
          </div>

          <Card className="p-8">
            <SubscribeCheckout userId={session.user_id} userEmail={session.email} />
          </Card>
        </div>
      </div>
    </div>
  )
}
