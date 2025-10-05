import { requireAuth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const sql = neon(process.env.DATABASE_URL!)

export default async function TestDashboard() {
  let diagnostics: any = {}

  try {
    // Test 1: Get session
    diagnostics.step1 = "Getting session..."
    const session = await requireAuth()
    diagnostics.step1 = "✓ Session obtained"
    diagnostics.session = {
      user_id: session.user_id,
      email: session.email,
      firstName: session.firstName,
      lastName: session.lastName,
    }

    // Test 2: Check admin
    diagnostics.step2 = "Checking admin status..."
    const adminResult = await sql`
      SELECT * FROM admin_users WHERE user_id = ${session.user_id}::uuid
    `
    diagnostics.step2 = "✓ Admin check complete"
    diagnostics.isAdmin = adminResult.length > 0

    // Test 3: Get subscription
    diagnostics.step3 = "Getting subscription..."
    const subscriptions = await sql`
      SELECT * FROM subscriptions 
      WHERE user_id = ${session.user_id}::uuid
      ORDER BY created_at DESC
      LIMIT 1
    `
    diagnostics.step3 = "✓ Subscription query complete"
    diagnostics.hasSubscription = subscriptions.length > 0

    // Test 4: Get alerts
    diagnostics.step4 = "Getting alerts..."
    const alerts = await sql`
      SELECT * FROM alerts 
      ORDER BY sent_at DESC 
      LIMIT 5
    `
    diagnostics.step4 = "✓ Alerts query complete"
    diagnostics.alertCount = alerts.length

    diagnostics.overallStatus = "✓ ALL TESTS PASSED"
  } catch (error: any) {
    diagnostics.error = error.message
    diagnostics.errorStack = error.stack
    diagnostics.errorName = error.name
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard Diagnostics</h1>
        <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
        <div className="mt-6 flex gap-3">
          <Link href="/dashboard" className="text-primary hover:underline">
            Try Dashboard
          </Link>
          <Link href="/admin" className="text-primary hover:underline">
            Try Admin
          </Link>
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      </Card>
    </div>
  )
}
