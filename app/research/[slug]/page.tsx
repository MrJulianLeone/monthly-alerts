import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Calendar, ArrowLeft, Shield } from "lucide-react"
import ShareButton from "./share-button"
import { getSession } from "@/lib/auth"
import { getResearchArticleBySlug, getResearchArticles } from "@/app/actions/research"
import { trackPageView } from "@/app/actions/page-views"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await getResearchArticleBySlug(slug)
  
  if (!article) {
    return {
      title: "Article Not Found - MonthlyAlerts.com",
    }
  }

  return {
    title: `${article.title} - MonthlyAlerts.com Research`,
    description: article.meta_description,
    openGraph: {
      title: article.title,
      description: article.meta_description,
      type: "article",
      publishedTime: article.published_at,
      authors: ["MonthlyAlerts.com"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.meta_description,
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await getResearchArticleBySlug(slug)
  
  if (!article) {
    notFound()
  }

  // Track page view
  await trackPageView(`/research/${slug}`)
  
  const session = await getSession()
  const allArticles = await getResearchArticles()
  
  // Get other articles for sidebar (excluding current)
  const otherArticles = allArticles.filter((a: any) => a.id !== article.id).slice(0, 5)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Convert markdown-like content to HTML
  const renderContent = (content: string) => {
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Check if it's a header
        if (paragraph.startsWith('## ')) {
          return (
            <h2 key={index} className="text-xl font-bold mt-8 mb-4 text-foreground">
              {paragraph.replace('## ', '')}
            </h2>
          )
        }
        if (paragraph.startsWith('# ')) {
          return (
            <h1 key={index} className="text-2xl font-bold mt-8 mb-4 text-foreground">
              {paragraph.replace('# ', '')}
            </h1>
          )
        }
        // Check if it's a list
        if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
          const items = paragraph.split('\n').filter(line => line.trim())
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} className="text-muted-foreground">
                  {item.replace(/^[-*]\s+/, '')}
                </li>
              ))}
            </ul>
          )
        }
        // Check if it's a numbered list
        if (/^\d+\.\s/.test(paragraph)) {
          const items = paragraph.split('\n').filter(line => line.trim())
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 mb-4">
              {items.map((item, i) => (
                <li key={i} className="text-muted-foreground">
                  {item.replace(/^\d+\.\s+/, '')}
                </li>
              ))}
            </ol>
          )
        }
        // Regular paragraph
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {paragraph}
          </p>
        )
      })
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description,
    datePublished: article.published_at,
    dateModified: article.created_at,
    author: {
      "@type": "Organization",
      name: "MonthlyAlerts.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MonthlyAlerts.com",
      logo: {
        "@type": "ImageObject",
        url: "https://monthlyalerts.com/android-chrome-512x512.png",
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
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

        {/* Article Content */}
        <article className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Link href="/research">
                <Button variant="ghost" size="sm" className="mb-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Research
                </Button>
              </Link>

              <header className="mb-8">
                <Badge className="mb-4 bg-primary/10 text-primary">
                  {article.topic}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={article.published_at}>
                      Published {formatDate(article.published_at)}
                    </time>
                  </div>
                  <span>•</span>
                  <span>MonthlyAlerts Research</span>
                </div>
              </header>

              {/* Article Body */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {renderContent(article.content)}
              </div>

              {/* Disclaimer */}
              <Card className="mt-12 p-6 bg-muted">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                    <p className="text-sm text-muted-foreground">
                      This research report is provided for informational purposes only and does not constitute investment advice. 
                      All investment decisions should be made based on your own research and consultation with qualified financial advisors. 
                      Past performance does not guarantee future results. Investing carries risk, including the potential loss of principal.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Share Section */}
              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">Share this research</h4>
                    <p className="text-sm text-muted-foreground">Help others discover this analysis</p>
                  </div>
                  <ShareButton title={article.title} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-8">
                <h3 className="font-semibold text-lg mb-4">More Research</h3>
                {otherArticles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    More research reports coming soon.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {otherArticles.map((otherArticle: any) => (
                      <Card key={otherArticle.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <Link href={`/research/${otherArticle.slug}`}>
                          <h4 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                            {otherArticle.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <time dateTime={otherArticle.published_at}>
                              {formatDate(otherArticle.published_at)}
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

                {/* Back to Research */}
                <div className="mt-6">
                  <Link href="/research">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      All Research Reports
                    </Button>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-8 mt-12">
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
    </>
  )
}
