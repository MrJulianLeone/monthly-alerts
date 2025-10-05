"use client"

import { useState } from "react"
import { changePassword } from "@/app/actions/profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function PasswordChangeForm() {
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
      form?.reset()
    }
  }

  return (
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
        <Input id="currentPassword" name="currentPassword" type="password" required disabled={loading} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input id="newPassword" name="newPassword" type="password" required minLength={8} disabled={loading} />
        <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} disabled={loading} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  )
}
