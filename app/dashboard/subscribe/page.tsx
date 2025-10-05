import { requireAuth } from "@/lib/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { SubscribeCheckout } from "@/components/subscribe-checkout"

export default async function SubscribePage() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
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
