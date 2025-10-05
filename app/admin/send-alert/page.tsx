import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import SendAlertForm from "./send-alert-form"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function SendAlertPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  // Get active subscriber count
  const activeSubscriptionsResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
  `
  const activeSubscriptions = Number(activeSubscriptionsResult[0]?.count || 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Send Monthly Alert</h1>
            <p className="text-muted-foreground">
              This alert will be sent to {activeSubscriptions} active subscriber{activeSubscriptions !== 1 ? 's' : ''}
            </p>
          </div>

          <Card className="p-6">
            <SendAlertForm userId={session.user_id} recipientCount={activeSubscriptions} />
          </Card>
        </div>
      </div>
    </div>
  )
}