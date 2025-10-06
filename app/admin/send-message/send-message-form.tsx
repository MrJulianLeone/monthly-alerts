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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    
    if (!confirm(`Send this message to ${recipientCount} subscriber${recipientCount !== 1 ? 's' : ''}?`)) {
      return
    }

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

  return (
    <form onSubmit={handleSend} className="space-y-6">
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

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Important Update for Subscribers"
          required
          disabled={loading || success}
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
          disabled={loading || success}
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
        <Button type="submit" size="lg" disabled={loading || success || !subject || !content}>
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Sending..." : `Send to ${recipientCount} Subscriber${recipientCount !== 1 ? 's' : ''}`}
        </Button>
        <Link href="/admin">
          <Button type="button" variant="outline" size="lg" disabled={loading || success}>
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  )
}

