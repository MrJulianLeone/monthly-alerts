"use client"

import { requireAuth } from "@/lib/auth"
import { updateProfile, changePassword } from "@/app/actions/profile"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, User, Mail, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePasswordChange(formData: FormData) {
    setPasswordError(null)
    setPasswordSuccess(false)
    setLoading(true)

    const result = await changePassword(formData)

    if (result?.error) {
      setPasswordError(result.error)
      setLoading(false)
    } else {
      setPasswordSuccess(true)
      setLoading(false)
      // Clear form
      const form = document.getElementById("password-form") as HTMLFormElement
      form.reset()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account information and security</p>
        </div>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <SettingsForm />
        </Card>

        {/* Change Password */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            <Lock className="h-4 w-4 inline mr-2" />
            Change Password
          </h2>
          <form id="password-form" action={handlePasswordChange} className="space-y-4">
            {passwordError && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg text-sm">
                Password changed successfully!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                disabled={loading}
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Changing Password..." : "Change Password"}
            </Button>
          </form>
        </Card>

        {/* Account Information */}
        <AccountInfo />
      </div>
    </div>
  )
}

// Server Component for fetching session data
async function SettingsForm() {
  const session = await requireAuth()

  return (
    <form action={updateProfile} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            <User className="h-4 w-4 inline mr-2" />
            First Name
          </Label>
          <Input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={session.firstName || ""}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={session.lastName || ""}
            placeholder="Enter your last name"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          <Mail className="h-4 w-4 inline mr-2" />
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={session.email}
          placeholder="Enter your email"
          required
        />
        <p className="text-xs text-muted-foreground">
          This email will be used for subscription notifications and monthly alerts
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit">Save Changes</Button>
        <Link href="/dashboard">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}

async function AccountInfo() {
  const session = await requireAuth()

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Account Information</h2>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Account ID</span>
          <span className="font-mono text-xs">{session.user_id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Member Since</span>
          <span>{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "N/A"}</span>
        </div>
      </div>
    </Card>
  )
}