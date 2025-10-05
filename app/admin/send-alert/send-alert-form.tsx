"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { sendAlert } from "@/app/actions/alerts"
import Link from "next/link"

export default function SendAlertForm({ userId, recipientCount }: { userId: string; recipientCount: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const result = await sendAlert(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setLoading(false)
      // Redirect after showing success message
      setTimeout(() => router.push("/admin"), 2000)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="recipientCount" value={recipientCount} />

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg text-sm">
          Alert sent successfully to {recipientCount} subscriber{recipientCount !== 1 ? 's' : ''}! Redirecting...
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="subject">Email Subject</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="e.g., November 2025 Stock Opportunities"
          required
          disabled={loading || success}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Email Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Write your monthly alert content here. Include company names, analysis, and key insights..."
          required
          disabled={loading || success}
          rows={12}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Tip: Include detailed analysis, company names, ticker symbols, and actionable insights
        </p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
        <p className="text-sm text-amber-600">
          <strong>Note:</strong> This will send an email to {recipientCount} active subscriber{recipientCount !== 1 ? 's' : ''}. Make
          sure to review your content carefully before sending.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading || success}>
          {loading ? "Sending..." : `Send Alert to ${recipientCount} Subscriber${recipientCount !== 1 ? 's' : ''}`}
        </Button>
        <Link href="/admin">
          <Button type="button" variant="outline" size="lg" disabled={loading}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}
