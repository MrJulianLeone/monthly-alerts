import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, LogOut, CreditCard } from "lucide-react"
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
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">Welcome, {session.firstName} {session.lastName}</h1>
          <p className="text-muted-foreground mb-6">Email: {session.email}</p>
          <p className="text-muted-foreground mb-6">Admin: {adminCheck ? "Yes ✓" : "No"}</p>
          
          <div className="space-y-4">
            <Link href="/dashboard/subscribe">
              <Button size="lg" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Subscribe to MonthlyAlerts - $29/month
              </Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline" size="lg" className="w-full">
                Account Settings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}