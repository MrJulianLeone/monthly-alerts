"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { generateResearchArticle } from "@/app/actions/research"
import { Loader2, CheckCircle2, Sparkles, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function GenerateArticleForm() {
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<{ slug: string; title: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(null)

    if (!topic.trim()) {
      setError("Please enter a research topic")
      return
    }

    setIsGenerating(true)

    try {
      const result = await generateResearchArticle(topic.trim())

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.slug) {
        setSuccess({ slug: result.slug, title: result.title || topic })
        setTopic("")
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate article")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">Research Topic</Label>
        <Input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., AI semiconductor stocks, EV battery technology trends, Renewable energy outlook 2025"
          disabled={isGenerating}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">
          Enter a financial topic, market trend, sector analysis, or investment theme for the AI to research and write about.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 text-green-600 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium mb-1">Article Published Successfully!</p>
              <p className="text-sm opacity-90 mb-3">&quot;{success.title}&quot;</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a 
                  href={`/research/${success.slug}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md border border-green-600 text-green-600 hover:bg-green-500/10 transition-colors"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Article
                </a>
                <a 
                  href="/admin/research"
                  className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md border border-green-600 text-green-600 hover:bg-green-500/10 transition-colors"
                >
                  View All Articles
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isGenerating || !topic.trim()}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Article... (this may take 30-60 seconds)
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Research Article
          </>
        )}
      </Button>

      {isGenerating && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            The AI is researching your topic and writing a detailed report with citations. Please wait...
          </p>
        </div>
      )}
    </form>
  )
}
