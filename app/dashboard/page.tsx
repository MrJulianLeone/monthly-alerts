import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Mail, CreditCard, LogOut, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  // Check if user is admin
  const adminCheck = await isAdmin(session.user_id)

  // Fetch user subscription status
  const subscriptions = await sql`
    SELECT * FROM subscriptions 
    WHERE user_id = ${session.user_id}::uuid
    ORDER BY created_at DESC
    LIMIT 1
  `

  const subscription = subscriptions[0]
  const isActive = subscription?.status === "active"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MonthlyAlerts.com</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
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
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.firstName || session.email}</h1>
          <p className="text-muted-foreground">Manage your subscription and view your monthly alerts</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">Monthly Subscription - $29/month</span>
                </div>
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
                  You don&apos;t have an active subscription. Subscribe now to start receiving monthly AI-curated stock alerts.
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

          {/* Account Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium">{session.email}</p>
              </div>
              <Link href="/dashboard/settings" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}