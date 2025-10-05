import { redirect } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Mail, LogOut, Send } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}
  `
  return result.length > 0
}

export default async function AdminDashboardPage() {
  const session = await requireAuth()

  const adminCheck = await isAdmin(session.user_id)

  if (!adminCheck) {
    redirect("/dashboard")
  }

  // Fetch statistics
  const totalUsersResult = await sql`
    SELECT COUNT(*) as count FROM users
  `
  const totalUsers = Number(totalUsersResult[0].count)

  const activeSubscriptionsResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
  `
  const activeSubscriptions = Number(activeSubscriptionsResult[0].count)

  const monthlyRevenueResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'
  `
  const monthlyRevenue = Number(monthlyRevenueResult[0].count) * 29

  const totalAlertsResult = await sql`
    SELECT COUNT(*) as count FROM alerts
  `
  const totalAlerts = Number(totalAlertsResult[0].count)

  // Fetch recent users
  const recentUsers = await sql`
    SELECT id, email, name, created_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT 10
  `

  // Fetch recent subscriptions
  const recentSubscriptions = await sql`
    SELECT s.*, u.email 
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
    LIMIT 10
  `

  // Fetch recent alerts
  const recentAlerts = await sql`
    SELECT * FROM alerts 
    ORDER BY sent_at DESC 
    LIMIT 5
  `

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MonthlyAlerts.com</span>
            </Link>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
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
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor user growth and manage monthly alerts</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{totalUsers}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{activeSubscriptions}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">${monthlyRevenue}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Alerts Sent</h3>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{totalAlerts}</p>
          </Card>
        </div>

        {/* Send Alert Section */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Send Monthly Alert</h2>
              <p className="text-sm text-muted-foreground">
                Compose and send alerts to all active subscribers ({activeSubscriptions} users)
              </p>
            </div>
            <Send className="h-5 w-5 text-muted-foreground" />
          </div>
          <Link href="/admin/send-alert">
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Compose New Alert
            </Button>
          </Link>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
            <div className="space-y-3">
              {recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.name || "No name"}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Subscriptions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Subscriptions</h2>
            <div className="space-y-3">
              {recentSubscriptions.map((sub: any) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{sub.email}</p>
                    <Badge variant={sub.status === "active" ? "default" : "secondary"} className="text-xs mt-1">
                      {sub.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alert History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Alert History</h2>
          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert: any) => (
                <div key={alert.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-semibold">{alert.subject}</h3>
                    <Badge variant="secondary">{alert.recipient_count} recipients</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{alert.content}</p>
                  <p className="text-xs text-muted-foreground">Sent on {new Date(alert.sent_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">No alerts sent yet</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
