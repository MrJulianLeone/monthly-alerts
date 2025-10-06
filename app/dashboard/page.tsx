import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, CreditCard, LogOut, Settings, CheckCircle2, XCircle } from "lucide-react"
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

  const adminCheck = await isAdmin(session.user_id)

  // Check subscription status
  const subscriptionResult = await sql`
    SELECT status, stripe_subscription_id, current_period_end 
    FROM subscriptions 
    WHERE user_id = ${session.user_id}::uuid 
    ORDER BY created_at DESC 
    LIMIT 1
  `

  const subscription = subscriptionResult[0]
  const isActive = subscription?.status === "active"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
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

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {session.firstName || session.email}</h1>
          <p className="text-muted-foreground">Manage your subscription and account settings</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Subscription Status */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Subscription Status</h2>
                <p className="text-sm text-muted-foreground">Your MonthlyAlerts subscription</p>
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
                <p className="text-sm text-muted-foreground mb-3">
                  You have an active subscription. You&apos;ll receive monthly AI-curated stock alerts via email.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Welcome email sent!</strong> Check your spam/junk folder and mark emails from{" "}
                    <span className="font-mono">no-reply@alerts.monthlyalerts.com</span> as &quot;Not Spam&quot; to ensure delivery.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/manage-subscription" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Subscribe to receive monthly AI-curated alerts about fast-growing stock opportunities.
                </p>
                <Link href="/dashboard/subscribe">
                  <Button size="lg" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now - $29.99/month + tax
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Account Settings */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">Account Settings</h2>
                <p className="text-sm text-muted-foreground">Manage your profile and security</p>
              </div>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium">{session.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-sm font-medium">{session.firstName} {session.lastName}</p>
                </div>
              </div>
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full">
                  Edit Profile & Change Password
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}