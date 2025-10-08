"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteAccount } from "@/app/actions/profile"
import { AlertTriangle } from "lucide-react"

export default function DeleteAccountForm() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await deleteAccount(formData)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // If successful, the action will redirect to home page
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <Button
        type="button"
        variant="destructive"
        onClick={() => setShowConfirm(true)}
      >
        Delete Account
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-destructive mb-1">Warning: This action cannot be undone!</p>
          <p className="text-muted-foreground">
            Deleting your account will:
          </p>
          <ul className="list-disc list-inside mt-2 text-muted-foreground space-y-1">
            <li>Cancel your active subscription (if any)</li>
            <li>Permanently delete all your account data</li>
            <li>Remove access to all your alerts</li>
            <li>Remove you from the subscriber list</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="confirmation">
            Type <span className="font-mono font-bold">DELETE</span> to confirm:
          </Label>
          <Input
            id="confirmation"
            name="confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE"
            required
            disabled={loading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="destructive"
            disabled={loading || confirmation !== "DELETE"}
          >
            {loading ? "Deleting Account..." : "Permanently Delete Account"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowConfirm(false)
              setConfirmation("")
              setError(null)
            }}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

