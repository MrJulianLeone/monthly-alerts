import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, CreditCard, LogOut, Settings } from "lucide-react"
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
          {/* Subscribe Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Get MonthlyAlerts</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Subscribe to receive monthly AI-curated alerts about fast-growing stock opportunities.
            </p>
            <Link href="/dashboard/subscribe">
              <Button size="lg" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe Now - $29/month
              </Button>
            </Link>
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