import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"
import AdminMessagesTable from "./admin-messages-table"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function MessagesListPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  // Fetch all messages
  const messages = await sql`
    SELECT id, subject, content, sent_at, recipient_count
    FROM messages
    ORDER BY sent_at DESC
  `

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">MonthlyAlerts.com</span>
              </Link>
              <Badge variant="secondary">Admin</Badge>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  User Dashboard
                </Button>
              </Link>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Messages History</h1>
          <p className="text-muted-foreground">
            Manage all messages sent to subscribers
          </p>
        </div>

        <AdminMessagesTable messages={messages as any[]} />
      </div>
    </div>
  )
}

