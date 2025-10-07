import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function SubscriptionsListPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  const page = parseInt(searchParams.page || "1")
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch all active subscriptions (including admin users)
  const subscriptions = await sql`
    SELECT s.*, u.email, u.first_name, u.last_name, u.created_at as user_registered,
           CASE WHEN au.user_id IS NOT NULL THEN true ELSE false END as is_admin
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN admin_users au ON u.id = au.user_id
    WHERE s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  // Get total count for pagination
  const totalResult = await sql`
    SELECT COUNT(*) as count FROM subscriptions s
    WHERE s.status = 'active'
  `
  const total = Number(totalResult[0].count)
  const totalPages = Math.ceil(total / limit)
  const monthlyRevenue = (total * 29.99).toFixed(2)

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
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Active Subscriptions</h1>
          </div>
          <p className="text-muted-foreground">
            Total: {total} active subscriptions • Monthly Revenue: ${monthlyRevenue}
          </p>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Role</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Registered</th>
                  <th className="text-left p-4 font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub: any) => (
                  <tr key={sub.id} className="border-b border-border last:border-0">
                    <td className="p-4">
                      {sub.first_name} {sub.last_name}
                    </td>
                    <td className="p-4 text-muted-foreground">{sub.email}</td>
                    <td className="p-4">
                      {sub.is_admin ? (
                        <Badge variant="outline" className="border-purple-600 text-purple-600">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      {sub.is_admin ? (
                        <Badge variant="outline" className="border-purple-600 text-purple-600 w-fit">
                          Admin
                        </Badge>
                      ) : sub.cancel_at_period_end ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-600 w-fit">
                          Cancelling
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600 w-fit">
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(sub.user_registered).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No active subscriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/subscriptions?page=${page - 1}`}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => {
                  // Show first, last, current, and neighbors
                  return p === 1 || p === totalPages || Math.abs(p - page) <= 1
                })
                .map((p, idx, arr) => {
                  // Add ellipsis
                  const prev = arr[idx - 1]
                  const showEllipsis = prev && p - prev > 1
                  return (
                    <div key={p} className="flex items-center gap-2">
                      {showEllipsis && <span className="px-2">...</span>}
                      <Link href={`/admin/subscriptions?page=${p}`}>
                        <Button
                          variant={p === page ? "default" : "outline"}
                          size="sm"
                        >
                          {p}
                        </Button>
                      </Link>
                    </div>
                  )
                })}
            </div>
            {page < totalPages && (
              <Link href={`/admin/subscriptions?page=${page + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

