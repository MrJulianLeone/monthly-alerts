import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

export default async function WorkingDashboard() {
  // Get session without auto-redirect
  const session = await getSession()
  
  // Handle redirect at page level
  if (!session) {
    redirect("/login")
  }

  // Check admin status
  const adminResult = await sql`
    SELECT * FROM admin_users WHERE user_id = ${session.user_id}::uuid
  `
  const isAdmin = adminResult.length > 0

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
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">Working Dashboard!</h1>
          <div className="space-y-2">
            <p><strong>Welcome:</strong> {session.firstName} {session.lastName}</p>
            <p><strong>Email:</strong> {session.email}</p>
            <p><strong>Admin:</strong> {isAdmin ? "Yes ✓" : "No"}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard">
              <Button>Try Regular Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
