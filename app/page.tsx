import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Mail, Sparkles, Shield, Clock, BarChart3, FileText } from "lucide-react"
import { getSession } from "@/lib/auth"
import { getCurrentSampleReport } from "@/app/actions/sample-report"
import { trackPageView } from "@/app/actions/page-views"

export default async function HomePage() {
  // Track page view
  await trackPageView("/")
  
  const session = await getSession()
  const sampleReport = await getCurrentSampleReport()

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
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Market Research
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Discover Interesting Companies Through AI-Powered Research
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Monthly alerts highlighting companies worth knowing about. Our proprietary AI models review thousands of signals daily to uncover interesting businesses across the market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Your First Alert Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            First alert free for all registered users • Then $29.99/month + tax
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary py-12 md:py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why MonthlyAlerts?</h2>
            <p className="text-muted-foreground text-lg">Cutting-edge AI technology meets financial expertise</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Proprietary AI Models</h3>
              <p className="text-muted-foreground text-sm">
                Our AI reviews thousands of market signals daily to identify companies with compelling characteristics worth researching further.
              </p>
            </Card>
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Monthly Insights</h3>
              <p className="text-muted-foreground text-sm">
                Receive research alerts directly to your inbox highlighting interesting companies our AI has identified. No spam, just quality insights.
              </p>
            </Card>
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Daily Signal Processing</h3>
              <p className="text-muted-foreground text-sm">
                Our AI continuously monitors market data, processing thousands of signals every day to surface companies worth your attention.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">Simple, transparent, and effective</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold text-lg mb-2">Register Free</h3>
            <p className="text-muted-foreground text-sm">
              Create your account to receive your first research alert completely free. No credit card required.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">Get First Alert Free</h3>
            <p className="text-muted-foreground text-sm">
              Receive your first research alert highlighting an interesting company our AI has identified at no cost.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Subscribe for More</h3>
            <p className="text-muted-foreground text-sm">
              Continue receiving monthly research alerts about interesting companies. Cancel anytime, no questions asked.
            </p>
          </div>
        </div>
        
        {/* Sample Report Link */}
        {sampleReport && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <Card className="p-6 bg-accent/5">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">See a Sample MonthlyAlert</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Download and review a sample of our research alerts to see the quality of insights you&apos;ll receive.
                  </p>
                  <Link href={sampleReport.file_path} target="_blank">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Sample Report (PDF)
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Pricing */}
      <section className="bg-secondary py-12 md:py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground text-lg">One plan, unlimited insights</p>
          </div>
          <Card className="max-w-md mx-auto p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Monthly Subscription</h3>
              <div className="flex items-baseline justify-center gap-2 mb-4">
                <span className="text-5xl font-bold">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Plus applicable taxes • Billed monthly • Cancel anytime</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm"><strong>First alert free</strong> for all registered users</span>
              </li>
              <li className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Monthly research alerts on interesting companies</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">AI-powered signal processing across thousands of data points</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Direct to your inbox</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Cancel anytime, no commitment</span>
              </li>
            </ul>
            <Link href="/signup" className="block">
              <Button size="lg" className="w-full">
                Get Your First Alert Free
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto p-6 bg-muted">
          <div className="flex gap-3">
            <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Important Disclaimer</h3>
              <p className="text-sm text-muted-foreground mb-3">
                MonthlyAlerts.com provides informational content only and is not investment advice. All investment
                decisions should be made based on your own research and consultation with qualified financial advisors.
                Past performance does not guarantee future results. Investing carries risk, including the
                potential loss of principal.
              </p>
              <p className="text-sm text-muted-foreground">
                MonthlyAlerts.com does not accept any marketing or promotion incentives from the companies that we highlight.
                In certain instances we may purchase shares of publicly traded companies after our alerts are issued so that 
                our interests align with the interests of our subscribers.
              </p>
            </div>
          </div>
        </Card>
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
