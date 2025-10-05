import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, LogOut } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MonthlyAlerts.com</span>
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

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
          <div className="space-y-2">
            <p><strong>Welcome:</strong> {session.firstName} {session.lastName}</p>
            <p><strong>Email:</strong> {session.email}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Link href="/dashboard/subscribe">
              <Button>Subscribe</Button>
            </Link>
            <Link href="/dashboard/settings">
              <Button variant="outline">Settings</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Admin</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}