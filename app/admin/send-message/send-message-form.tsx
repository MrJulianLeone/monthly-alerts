"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { sendMessage } from "@/app/actions/messages"
import { Send } from "lucide-react"
import Link from "next/link"

export default function SendMessageForm({ userId, recipientCount }: { userId: string; recipientCount: number }) {
  const [step, setStep] = useState<"compose" | "review">("compose")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    setStep("review")
  }

  async function handleSend() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("subject", subject)
    formData.append("content", content)

    const result = await sendMessage(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push("/admin"), 2000)
    }
  }

  if (step === "review") {
    return (
      <div className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 text-green-600 px-4 py-3 rounded-lg text-sm">
            Message sent successfully to {recipientCount} subscriber{recipientCount !== 1 ? 's' : ''}! Redirecting...
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewSubject">Email Subject</Label>
            <Input
              id="reviewSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading || success}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewContent">Email Content</Label>
            <Textarea
              id="reviewContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading || success}
              rows={12}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Review and edit your message before sending
            </p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <p className="text-sm text-amber-600">
            <strong>Ready to send?</strong> This will email {recipientCount} active subscriber{recipientCount !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSend} size="lg" disabled={loading || success}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : `Send to ${recipientCount} Subscriber${recipientCount !== 1 ? 's' : ''}`}
          </Button>
          <Button
            onClick={() => setStep("compose")}
            variant="outline"
            size="lg"
            disabled={loading || success}
          >
            Back to Edit
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleReview} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Important Update for Subscribers"
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          The subject line for your email
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Message</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your message to subscribers..."
          required
          disabled={loading}
          rows={12}
        />
        <p className="text-xs text-muted-foreground">
          Write your message. Disclaimer and unsubscribe link will be added automatically.
        </p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> This message will be sent to {recipientCount} active subscriber{recipientCount !== 1 ? 's' : ''} and will NOT be logged as an alert.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading || !subject || !content}>
          Continue to Review
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

