import { redirect } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import SetupAccountForm from "./setup-account-form"

export default async function SetupAccountPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      {/* Setup Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Complete Your Account</h1>
            <p className="text-muted-foreground">Set your password and name to get started</p>
          </div>

          <SetupAccountForm token={token} />
        </Card>
      </div>
    </div>
  )
}

