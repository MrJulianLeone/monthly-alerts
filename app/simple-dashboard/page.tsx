import { requireAuth } from "@/lib/auth"
import { Card } from "@/components/ui/card"

export default async function SimpleDashboard() {
  const session = await requireAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Simple Dashboard - Working!</h1>
        <div className="space-y-2">
          <p><strong>Email:</strong> {session.email}</p>
          <p><strong>Name:</strong> {session.firstName} {session.lastName}</p>
          <p><strong>User ID:</strong> {session.user_id}</p>
        </div>
      </Card>
    </div>
  )
}
