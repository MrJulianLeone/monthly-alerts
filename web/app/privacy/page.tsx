import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy Policy — MonthlyAlerts" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effective="Effective August 28, 2026">
      <p>
        This Privacy Policy explains what personal data MonthlyAlerts.com (the
        &quot;Service,&quot; &quot;we,&quot; &quot;us&quot;) collects, how we use it,
        and the choices and rights you have — wherever in the world you use the
        Service. We aim to collect the minimum needed to run a multilingual
        construction checklist tool, and nothing more.
      </p>

      <h2>1. Data we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong>: email address (required), name, and
          optionally company and phone number, plus your preferred language.
        </li>
        <li>
          <strong>Project content</strong>: checklists, items, comments, and photos
          that you and your project members create.
        </li>
        <li>
          <strong>Technical data</strong>: IP address and browser user-agent recorded
          when a sign-in session is created, used for security.
        </li>
        <li>
          <strong>Payment data — none.</strong> Payments are processed entirely by
          Stripe. We never receive, capture, or store card numbers or other payment
          credentials; we keep only a payment reference and date. See Stripe&apos;s
          privacy policy for how it handles your payment details.
        </li>
      </ul>
      <p>
        We use only two cookies: a session cookie that keeps you signed in and a
        cookie remembering your language choice.{" "}
        <strong>We use no advertising or third-party analytics trackers.</strong>
      </p>

      <h2>2. How we use data</h2>
      <ul>
        <li>To provide the Service: accounts, projects, checklists, and photos.</li>
        <li>
          <strong>AI translation</strong>: text your team writes is sent to OpenAI to
          be translated into other members&apos; languages, on a best-efforts basis.
          Translations are cached so the same text is not re-processed repeatedly.
        </li>
        <li>
          <strong>Email</strong>: sign-in links, project invitations, and a monthly
          project status summary (which you can turn off in Settings or via the
          unsubscribe link in any status email). We send no marketing email.
        </li>
        <li>Security, abuse prevention, and legal compliance.</li>
      </ul>
      <p>
        Where the GDPR or similar laws apply, our legal bases are performance of a
        contract (providing the Service you signed up for), legitimate interests
        (security, service operation), and consent where required.
      </p>

      <h2>3. Who sees your data</h2>
      <ul>
        <li>
          <strong>Your project members</strong> see your name, company, preferred
          language, and the content you post in shared projects.
        </li>
        <li>
          <strong>Service providers (processors)</strong> that host and power the
          Service: Vercel (hosting, photo storage), Neon (database), OpenAI
          (translation), Resend (email delivery), and Stripe (payments). Each
          processes data only to provide its function.
        </li>
        <li>Authorities, where the law genuinely requires it.</li>
      </ul>
      <p>
        <strong>We do not sell or rent personal data</strong>, and we do not share it
        with advertisers or data brokers.
      </p>

      <h2>4. International transfers</h2>
      <p>
        The Service is hosted in the United States. If you use it from outside the
        US, your data is transferred to and processed in the US and other countries
        where our providers operate. Where laws such as the GDPR apply, transfers
        rely on appropriate safeguards, including the providers&apos; standard
        contractual clauses and equivalent mechanisms.
      </p>

      <h2>5. Retention</h2>
      <ul>
        <li>
          <strong>Projects</strong> (checklists, comments, photos) are kept for{" "}
          <strong>two years from payment</strong> (or creation, for unpaid projects),
          then permanently deleted automatically. Owners can delete a project sooner
          at any time.
        </li>
        <li>
          <strong>Account data</strong> is kept while your account is active and
          deleted on verified request.
        </li>
        <li>
          <strong>Translation cache</strong> entries are anonymous text pairs keyed
          by a content hash and are not linked to your account.
        </li>
      </ul>

      <h2>6. Your rights</h2>
      <p>
        Depending on where you live (including the EU/UK under the GDPR, California
        under the CCPA/CPRA, Brazil under the LGPD, and similar laws elsewhere), you
        may have the right to access, correct, delete, or receive a copy of your
        personal data, to object to or restrict certain processing, and to complain
        to your local data-protection authority. We honor these requests for all
        users regardless of location: submit a request through our{" "}
        <Link href="/contact">contact form</Link> using your account email address and we will
        verify and respond within the time required by applicable law. We do not
        discriminate against you for exercising any right.
      </p>

      <h2>7. Security</h2>
      <p>
        Data is encrypted in transit; sign-in uses one-time emailed links (no
        passwords to steal); session and sign-in tokens are stored only as
        cryptographic hashes. No system is perfectly secure, so use judgment about
        what you upload.
      </p>

      <h2>8. Children</h2>
      <p>
        The Service is a professional tool and is not directed to children under 16.
        We do not knowingly collect data from them; if you believe a child has
        created an account, contact us and we will delete it.
      </p>

      <h2>9. Changes</h2>
      <p>
        We will post any changes to this policy on this page with a new effective
        date, and for material changes we will notify account holders by email.
      </p>

      <h2>10. Contact</h2>
      <p>
        Privacy questions and requests: use our <Link href="/contact">contact form</Link>. See
        also our <Link href="/terms">Terms of Use</Link>.
      </p>
    </LegalPage>
  );
}
