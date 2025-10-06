import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information Collected</h2>
              <p className="text-muted-foreground mb-3">
                MonthlyAlerts.com collects only the following personal information when you subscribe:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Name</li>
                <li>Email address</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                No payment information is collected or stored by MonthlyAlerts.com. All payments are processed securely by
                Stripe, which handles all billing and credit card data in accordance with its own privacy policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use of Information</h2>
              <p className="text-muted-foreground mb-3">
                Collected information is used solely to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Deliver the MonthlyAlerts.com newsletter</li>
                <li>Manage your subscription status</li>
                <li>Communicate essential updates related to the service</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Your information is not sold, rented, or shared with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                All subscriber data is stored securely using industry-standard encryption and access controls. Access is
                limited to authorized administrators only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Deletion</h2>
              <p className="text-muted-foreground mb-3">
                You may request deletion of all your data at any time by emailing{" "}
                <a href="mailto:admin@monthlyalerts.com" className="text-primary hover:underline">
                  admin@monthlyalerts.com
                </a>
                .
              </p>
              <p className="text-muted-foreground">
                Upon request, all personally identifiable information will be permanently deleted from our systems within a
                reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
              <p className="text-muted-foreground">
                MonthlyAlerts.com uses Stripe for payment processing. Stripe&apos;s handling of your information is governed
                by its own Privacy Policy. MonthlyAlerts.com does not have access to or store any credit card or payment
                details.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
              <p className="text-muted-foreground">
                MonthlyAlerts.com does not use cookies or tracking technologies for analytics or advertising.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated
                effective date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
              <p className="text-muted-foreground mb-2">For privacy-related questions or deletion requests, contact:</p>
              <p className="text-muted-foreground">
                <strong>Email:</strong>{" "}
                <a href="mailto:admin@monthlyalerts.com" className="text-primary hover:underline">
                  admin@monthlyalerts.com
                </a>
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
