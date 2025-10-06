import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logout } from "@/app/actions/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, LogOut, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export default async function AlertsListPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) redirect("/dashboard")

  const page = parseInt(searchParams.page || "1")
  const limit = 10
  const offset = (page - 1) * limit

  // Fetch alerts
  const alerts = await sql`
    SELECT a.*, u.email as creator_email, u.first_name, u.last_name
    FROM alerts a
    LEFT JOIN users u ON a.created_by = u.id
    ORDER BY a.sent_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  // Get total count for pagination
  const totalResult = await sql`
    SELECT COUNT(*) as count FROM alerts
  `
  const total = Number(totalResult[0].count)
  const totalPages = Math.ceil(total / limit)

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
            <Mail className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Alerts History</h1>
          </div>
          <p className="text-muted-foreground">
            Total: {total} alerts sent
          </p>
        </div>

        <div className="space-y-4">
          {alerts.map((alert: any) => (
            <Card key={alert.id} className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{alert.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        Sent: {new Date(alert.sent_at).toLocaleString()}
                      </span>
                      <span>•</span>
                      <span>
                        Recipients: {alert.recipient_count}
                      </span>
                      {alert.creator_email && (
                        <>
                          <span>•</span>
                          <span>
                            By: {alert.first_name} {alert.last_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">Sent</Badge>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {alert.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
          {alerts.length === 0 && (
            <Card className="p-8">
              <p className="text-center text-muted-foreground">
                No alerts sent yet
              </p>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/alerts?page=${page - 1}`}>
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
                      <Link href={`/admin/alerts?page=${p}`}>
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
              <Link href={`/admin/alerts?page=${page + 1}`}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

