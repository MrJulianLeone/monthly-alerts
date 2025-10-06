import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Mail, LogOut, Send, MessageSquare } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  // Fetch statistics (including all users and admin users)
  const totalUsersResult = await sql`
    SELECT COUNT(*) as count FROM users
  `
  const totalUsers = Number(totalUsersResult[0].count)

  const activeSubscriptionsResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions s
    WHERE s.status = 'active'
  `
  const activeSubscriptions = Number(activeSubscriptionsResult[0].count)

  const totalAlertsResult = await sql`
    SELECT COUNT(*) as count FROM alerts
  `
  const totalAlerts = Number(totalAlertsResult[0].count)

  const totalMessagesResult = await sql`
    SELECT COUNT(*) as count FROM messages
  `
  const totalMessages = Number(totalMessagesResult[0].count)

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor user growth and manage monthly alerts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </Card>
          </Link>

          <Link href="/admin/subscriptions">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{activeSubscriptions}</p>
            </Card>
          </Link>

          <Link href="/admin/alerts">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Alerts Sent</h3>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{totalAlerts}</p>
            </Card>
          </Link>

          <Link href="/admin/messages">
            <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Messages Sent</h3>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{totalMessages}</p>
            </Card>
          </Link>
        </div>

        {/* Send Alert Section */}
        <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Send Monthly Alert</h2>
              <p className="text-sm text-muted-foreground">
                Generate an AI-powered stock alert to send to all {activeSubscriptions} active subscribers
              </p>
            </div>
            <Link href="/admin/send-alert">
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Compose Alert
              </Button>
            </Link>
          </div>
        </Card>

        {/* Send Message Section */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Send Message to Subscribers</h2>
              <p className="text-sm text-muted-foreground">
                Compose and send a custom message to all {activeSubscriptions} active subscribers
              </p>
            </div>
            <Link href="/admin/send-message">
              <Button>
                <MessageSquare className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}