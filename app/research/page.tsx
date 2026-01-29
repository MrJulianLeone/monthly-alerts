import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, FileText, Calendar, ArrowRight } from "lucide-react"
import { getSession } from "@/lib/auth"
import { getLatestResearchArticle, getResearchArticles } from "@/app/actions/research"
import { trackPageView } from "@/app/actions/page-views"

export const metadata: Metadata = {
  title: "Research - MonthlyAlerts.com",
  description: "In-depth research reports on market trends, investment themes, and financial analysis from MonthlyAlerts.com",
  openGraph: {
    title: "Research - MonthlyAlerts.com",
    description: "In-depth research reports on market trends, investment themes, and financial analysis",
    type: "website",
  },
}

export default async function ResearchPage() {
  // Track page view
  await trackPageView("/research")
  
  const session = await getSession()
  const latestArticle = await getLatestResearchArticle()
  const allArticles = await getResearchArticles()
  
  // Get previous articles (all except the latest)
  const previousArticles = allArticles.slice(1)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Extract first paragraph for preview
  const getExcerpt = (content: string, maxLength: number = 300) => {
    // Remove markdown headers
    const cleanContent = content.replace(/^##?\s+.+$/gm, '').trim()
    const firstParagraph = cleanContent.split('\n\n')[0] || cleanContent
    if (firstParagraph.length <= maxLength) return firstParagraph
    return firstParagraph.substring(0, maxLength).trim() + '...'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
          {session ? (
            <Link href="/dashboard">
              <Button variant="default" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/signup">
              <Button variant="default" size="sm">
                Register
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research Reports</h1>
          <p className="text-lg text-muted-foreground">
            In-depth analysis of market trends, investment themes, and financial insights from our AI-powered research team.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container max-w-6xl mx-auto px-4 pb-16">
        {!latestArticle ? (
          <Card className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold mb-2">No Research Articles Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon for in-depth research reports on market trends and investment themes.
            </p>
            <Link href="/">
              <Button variant="outline">
                Return to Home
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Latest Article - Featured */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Badge className="bg-primary/10 text-primary">Latest Research</Badge>
              </div>
              <article>
                <Link href={`/research/${latestArticle.slug}`}>
                  <h2 className="text-2xl md:text-3xl font-bold mb-3 hover:text-primary transition-colors">
                    {latestArticle.title}
                  </h2>
                </Link>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={latestArticle.published_at}>
                      {formatDate(latestArticle.published_at)}
                    </time>
                  </div>
                  <span>•</span>
                  <span>{latestArticle.topic}</span>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {latestArticle.meta_description || getExcerpt(latestArticle.content)}
                </p>
                <Link href={`/research/${latestArticle.slug}`}>
                  <Button>
                    Read Full Report
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </article>

              {/* Article Preview - Markdown rendered excerpt */}
              <Card className="mt-8 p-6 bg-muted/30">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="line-clamp-6 text-muted-foreground">
                    {getExcerpt(latestArticle.content, 600)}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Link href={`/research/${latestArticle.slug}`} className="text-primary text-sm font-medium hover:underline">
                    Continue reading →
                  </Link>
                </div>
              </Card>
            </div>

            {/* Previous Articles - Sidebar */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-lg mb-4">Previous Reports</h3>
              {previousArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  More research reports coming soon.
                </p>
              ) : (
                <div className="space-y-4">
                  {previousArticles.map((article: any) => (
                    <Card key={article.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <Link href={`/research/${article.slug}`}>
                        <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <time dateTime={article.published_at}>
                            {formatDate(article.published_at)}
                          </time>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}

              {/* CTA Card */}
              <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-2">Get Monthly Alerts</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Subscribe to receive AI-powered research alerts on interesting companies delivered to your inbox.
                </p>
                <Link href="/signup">
                  <Button size="sm" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">MonthlyAlerts.com</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 MonthlyAlerts.com. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/research" className="text-muted-foreground hover:text-foreground">
                Research
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
