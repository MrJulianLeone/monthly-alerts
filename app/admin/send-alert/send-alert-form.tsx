"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { sendAlert } from "@/app/actions/alerts"
import { generateAlert } from "@/app/actions/generate-alert"
import { Sparkles, Send } from "lucide-react"
import Link from "next/link"

export default function SendAlertForm({ userId, recipientCount }: { userId: string; recipientCount: number }) {
  const [step, setStep] = useState<"input" | "review">("input")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Form inputs
  const [ticker, setTicker] = useState("")
  const [company, setCompany] = useState("")
  const [price, setPrice] = useState("")
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive")

  // Generated content
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await generateAlert(ticker, company, price, sentiment)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.success) {
      setSubject(result.subject || "")
      setContent(result.content || "")
      setStep("review")
      setLoading(false)
    }
  }

  async function handleSend() {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("subject", subject)
    formData.append("content", content)
    formData.append("recipientCount", String(recipientCount))

    const result = await sendAlert(formData)

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
            Alert sent successfully to {recipientCount} subscriber{recipientCount !== 1 ? 's' : ''}! Redirecting...
          </div>
        )}

        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI-Generated Alert</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Ticker:</strong> {ticker}</p>
            <p><strong>Company:</strong> {company}</p>
            <p><strong>Price:</strong> {price}</p>
            <p><strong>Sentiment:</strong> {sentiment}</p>
          </div>
        </Card>

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
              Review and edit the AI-generated content before sending
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
            onClick={() => setStep("input")}
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
    <form onSubmit={handleGenerate} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker Symbol</Label>
          <Input
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g., Apple Inc."
            required
            disabled={loading}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Current Price</Label>
          <Input
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., $150.25"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sentiment">Sentiment</Label>
          <select
            id="sentiment"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value as "positive" | "negative")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={loading}
          >
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              AI-Powered Alert Generation
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
              AI searches the web for recent news and creates a 90-word factual update with citations
            </p>
            <p className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Web Search Enabled:</strong> AI will find and cite actual recent news from the past 30 days
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          <Sparkles className="h-4 w-4 mr-2" />
          {loading ? "Generating..." : "Generate Alert with AI"}
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