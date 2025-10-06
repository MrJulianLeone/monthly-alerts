import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </Link>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Subscription and Use</h1>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Purpose</h2>
              <p className="text-muted-foreground">
                MonthlyAlerts.com provides a subscription-based newsletter highlighting companies, products, and trends
                the authors find interesting. The content is for informational and educational purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. No Investment Advice</h2>
              <p className="text-muted-foreground mb-3">
                MonthlyAlerts.com is not a financial advisor, broker, or investment firm. Nothing in the newsletter
                constitutes investment, financial, or trading advice. Any reference to stock prices, performance, or
                valuation is included solely to illustrate company activity or to support educational discussion.
              </p>
              <p className="text-muted-foreground">
                Subscribers should not buy, sell, or hold securities based on the newsletter. Always consult a qualified
                financial advisor before making investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Educational Content Only</h2>
              <p className="text-muted-foreground">
                The newsletter discusses companies and products that may have publicly traded securities. Mentions of such
                securities are incidental and meant to support commentary on innovation, business models, or market trends.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Subscription and Cancellation</h2>
              <p className="text-muted-foreground">
                Subscriptions are billed monthly in advance at $29.99 plus applicable taxes. Users may cancel at any time
                through their account page. Cancellation stops future billing but does not refund past charges. Access
                continues until the end of the paid period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Accuracy and Liability</h2>
              <p className="text-muted-foreground mb-3">
                MonthlyAlerts.com strives for factual accuracy but makes no guarantee of completeness or timeliness. All
                information is provided &quot;as is.&quot;
              </p>
              <p className="text-muted-foreground">
                MonthlyAlerts.com, its authors, and affiliates are not liable for any losses, damages, or claims resulting
                from reliance on newsletter content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, including text, images, and formatting, belongs to MonthlyAlerts.com. Subscribers may not
                reproduce, distribute, or republish the content without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy</h2>
              <p className="text-muted-foreground">
                Email addresses and payment information are stored securely and used only for subscription management and
                content delivery.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Updates to Terms</h2>
              <p className="text-muted-foreground">
                MonthlyAlerts.com may modify these terms at any time. Continued subscription constitutes acceptance of
                updated terms.
              </p>
            </section>

            <div className="border-t border-border pt-6 mt-8">
              <p className="text-sm text-muted-foreground">
                <strong>Effective Date:</strong> October 5, 2025
              </p>
            </div>
          </div>
        </Card>
      </div>

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
