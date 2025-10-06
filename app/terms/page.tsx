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

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Nature of Service</h2>
              <p className="text-muted-foreground">
                MonthlyAlerts.com (&quot;the Service&quot;) publishes financial and business research for educational and
                informational purposes. The Service provides general commentary, data analysis, and company profiles prepared
                from public information believed to be reliable. Nothing on this site or in email alerts constitutes a
                personalized investment recommendation, financial planning, or solicitation to buy or sell any security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Regulatory Classification</h2>
              <p className="text-muted-foreground mb-3">
                MonthlyAlerts.com is not registered as an investment adviser under the Investment Advisers Act of 1940 or any
                state securities law because the Service qualifies for the &quot;publisher&apos;s exemption.&quot;
              </p>
              <p className="text-muted-foreground mb-3">
                Under SEC Release IA-1092 and related case law (e.g., Lowe v. SEC, 472 U.S. 181 (1985)), publishers who
                provide impersonal and bona fide financial research available to the general public and not tailored to
                specific client objectives are not considered investment advisers.
              </p>
              <p className="text-muted-foreground">
                Our work is therefore classified as investment research, similar in nature to services such as Value Line,
                Morningstar, and The Wall Street Journal&apos;s financial sections.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. No Personalized Advice</h2>
              <p className="text-muted-foreground">
                The information presented does not consider any reader&apos;s personal financial situation, objectives, or risk
                tolerance. You must make your own investment decisions or consult a licensed professional before acting on any
                information contained herein.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Accuracy and Liability</h2>
              <p className="text-muted-foreground">
                All data and opinions are based on sources believed reliable but are not guaranteed for accuracy or
                completeness. Market data and prices may change without notice. MonthlyAlerts.com and its contributors assume
                no responsibility for losses or damages arising from reliance on the material provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Performance and Auditing</h2>
              <p className="text-muted-foreground">
                Past performance or back-tested results are not indicative of future outcomes. Any performance tracking or
                audit report is provided solely for transparency and should not be interpreted as a recommendation or forecast.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Subscription and Cancellation</h2>
              <p className="text-muted-foreground">
                Subscribers may cancel at any time. Upon cancellation, access to future alerts terminates at the end of the
                current billing period. No refunds are issued for past periods.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All content, graphics, and code are the property of MonthlyAlerts.com. Redistribution without permission is
                prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
              <p className="text-muted-foreground">
                Questions about these terms may be directed to admin at monthlyalerts dot com.
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