import { requireAuth } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Mail, CreditCard, LogOut, Calendar, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}
  `
  return result.length > 0
}

export default async function DashboardPage() {
  const session = await requireAuth()

  // Check if user is admin
  const adminCheck = await isAdmin(session.user_id)

  // Fetch user subscription status
  const subscriptions = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${session.user_id}
    ORDER BY created_at DESC
    LIMIT 1
  `

  const subscription = subscriptions[0]
  const isActive = subscription?.status === "active"

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
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
          <div className="flex items-center gap-4">
            {adminCheck && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin Dashboard
                </Button>
              </Link>
            )}
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
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.firstName || session.email}</h1>
          <p className="text-muted-foreground">Manage your subscription and view your monthly alerts</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Subscription Status Card */}
          <Card className="p-6 md:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Subscription Status</h2>
                <p className="text-sm text-muted-foreground">Manage your monthly subscription</p>
              </div>
              {isActive ? (
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </div>

            {isActive ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next billing date:</span>
                  <span className="font-medium">
                    {subscription.current_period_end
                      ? new Date(subscription.current_period_end).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Monthly Subscription - $29/month</span>
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-sm text-amber-600">
                      Your subscription will be canceled at the end of the current billing period.
                    </p>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <Link href="/dashboard/manage-subscription">
                    <Button variant="outline" size="sm">
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You don't have an active subscription. Subscribe now to start receiving monthly AI-curated stock
                  alerts.
                </p>
                <Link href="/dashboard/subscribe">
                  <Button>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now - $29/month
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium">{session.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="text-sm font-medium">
                  {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alerts Received</p>
                <p className="text-sm font-medium">{recentAlerts.length} total</p>
              </div>
              <Link href="/dashboard/settings" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Recent Alerts</h2>
              <p className="text-sm text-muted-foreground">Your monthly stock opportunity alerts</p>
            </div>
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>

          {recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert: any) => (
                <div key={alert.id} className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{alert.subject}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{alert.content}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">{new Date(alert.sent_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold mb-2">No alerts yet</h3>
              <p className="text-sm text-muted-foreground">
                {isActive
                  ? "You'll receive your first monthly alert soon!"
                  : "Subscribe to start receiving monthly stock alerts"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
