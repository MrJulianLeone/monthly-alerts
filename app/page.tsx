import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TrendingUp, Mail, Sparkles, Shield, Clock, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">MonthlyAlerts.com</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Stock Discovery
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Discover Fast-Growing Companies Before Everyone Else
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            Get monthly AI-curated alerts about emerging stock opportunities. Our advanced algorithms analyze thousands
            of companies to find the next big winners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Only $29/month • Cancel anytime</p>
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
              <h3 className="font-semibold text-lg mb-2">AI-Powered Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Our proprietary AI scans thousands of companies, analyzing growth metrics, market trends, and financial
                indicators.
              </p>
            </Card>
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Monthly Insights</h3>
              <p className="text-muted-foreground text-sm">
                Receive curated alerts directly to your inbox. No spam, just high-quality opportunities once a month.
              </p>
            </Card>
            <Card className="p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Early Detection</h3>
              <p className="text-muted-foreground text-sm">
                Identify fast-growing companies before they hit mainstream radar. Stay ahead of the market.
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
            <h3 className="font-semibold text-lg mb-2">Subscribe</h3>
            <p className="text-muted-foreground text-sm">
              Sign up and start your subscription. Cancel anytime, no questions asked.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Analyzes</h3>
            <p className="text-muted-foreground text-sm">
              Our AI continuously monitors market data and identifies emerging opportunities.
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold text-lg mb-2">Get Alerts</h3>
            <p className="text-muted-foreground text-sm">
              Receive monthly emails with detailed analysis and actionable insights.
            </p>
          </div>
        </div>
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
                <span className="text-5xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm">Billed monthly • Cancel anytime</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Monthly AI-curated stock alerts</span>
              </li>
              <li className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <span className="text-sm">Detailed company analysis</span>
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
                Start Your Free Trial
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
              <p className="text-sm text-muted-foreground">
                MonthlyAlerts.com provides informational content only and is not investment advice. All investment
                decisions should be made based on your own research and consultation with qualified financial advisors.
                Past performance does not guarantee future results. Investing in stocks carries risk, including the
                potential loss of principal.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
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
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
