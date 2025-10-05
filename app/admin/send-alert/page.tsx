import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { sendAlert } from "@/app/actions/alerts"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}
  `
  return result.length > 0
}

export default async function SendAlertPage() {
  const session = await requireAuth()

  const adminCheck = await isAdmin(session.user_id)

  if (!adminCheck) {
    redirect("/dashboard")
  }

  // Get active subscriber count
  const activeSubscriptionsResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
  `
  const activeSubscriptions = Number(activeSubscriptionsResult[0].count)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Send Monthly Alert</h1>
            <p className="text-muted-foreground">This alert will be sent to {activeSubscriptions} active subscribers</p>
          </div>

          <Card className="p-6">
            <form action={sendAlert} className="space-y-6">
              <input type="hidden" name="userId" value={session.user_id} />
              <input type="hidden" name="recipientCount" value={activeSubscriptions} />

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g., January 2025 Stock Opportunities"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your monthly alert content here. Include company names, analysis, and key insights..."
                  required
                  rows={12}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include detailed analysis, company names, ticker symbols, and actionable insights
                </p>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-sm text-amber-600">
                  <strong>Note:</strong> This will send an email to all {activeSubscriptions} active subscribers. Make
                  sure to review your content carefully before sending.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="lg">
                  Send Alert to {activeSubscriptions} Subscribers
                </Button>
                <Link href="/admin">
                  <Button type="button" variant="outline" size="lg">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
