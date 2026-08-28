import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of Use — MonthlyAlerts" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" effective="Effective August 28, 2026">
      <p>
        These Terms of Use (&quot;Terms&quot;) govern your access to and use of
        MonthlyAlerts.com (the &quot;Service&quot;), operated by MonthlyAlerts
        (&quot;we,&quot; &quot;us&quot;). By creating an account, creating a project, or
        using the Service in any way, you agree to these Terms. If you do not agree, do
        not use the Service.
      </p>

      <h2>1. What the Service is — and is not</h2>
      <p>
        MonthlyAlerts is a <strong>note-taking and checklist tool</strong> for
        construction projects. It lets teams create checklists, record progress, attach
        photos, and read each other&apos;s entries translated into their preferred
        language.
      </p>
      <p>
        <strong>
          The Service is not a substitute for qualified, licensed professionals.
        </strong>{" "}
        It does not provide engineering, architectural, legal, safety, building-code, or
        any other professional advice. Content in the Service — including checklist
        items, measurements, specifications, and requirements — is user-entered
        note-taking material. Before acting on any measurement, specification, or
        requirement, you must verify it against applicable local laws, building codes,
        regulations, and project specifications, and consult qualified licensed
        professionals (such as engineers, architects, electricians, and inspectors)
        where required. You are solely responsible for the accuracy of your work and
        your compliance with the laws and standards that apply to your project and
        location.
      </p>

      <h2>2. AI translation — best efforts</h2>
      <p>
        Content written by project members is translated between languages using
        artificial intelligence. Translation is provided on a{" "}
        <strong>best-efforts basis</strong>: it may contain errors, omissions, or
        imprecise terminology, and technical or trade terms may not translate
        perfectly. The <strong>original-language version</strong> of any entry (the
        language its author wrote it in) is the authoritative version between users. Do
        not rely on a translation alone for anything safety-critical, contractual, or
        code-related — confirm it in the original language or with a qualified
        translator.
      </p>

      <h2>3. Accounts</h2>
      <p>
        You sign in with a one-time link sent to your email address; there are no
        passwords. You are responsible for maintaining control of your email account
        and for all activity that occurs under your MonthlyAlerts account. You must
        provide accurate information and be at least 16 years old (or the age of
        digital consent in your country, if higher) to use the Service.
      </p>

      <h2>4. Projects, roles, and your content</h2>
      <p>
        Project owners control who joins their projects and what role each member has
        (editor or commenter). You keep all rights to the content you submit. You grant
        us a worldwide, non-exclusive license to host, store, reproduce, translate, and
        display your content solely to operate the Service — including sending it to
        our AI translation provider and showing it to the other members of your
        project. You are responsible for the content you post and must have the right
        to share it.
      </p>

      <h2>5. Payments</h2>
      <p>
        Creating a project may require a one-time project fee, shown before checkout.{" "}
        <strong>
          All payments are processed by Stripe. We never receive, capture, or store
          your card number or other payment credentials
        </strong>{" "}
        — payment information is provided directly to Stripe and is governed by
        Stripe&apos;s own terms and privacy policy. We retain only a payment reference
        and date. Except where required by applicable law, fees are non-refundable.
        Prices may change, but changes do not affect projects already paid for.
      </p>

      <h2>6. Storage and expiration</h2>
      <p>
        To conserve storage, <strong>each project is retained for two years from the
        date of payment</strong> (or from creation, for projects created without
        payment). After that period the project — including its checklist, comments,
        and photos — is <strong>permanently deleted automatically</strong>. This policy
        is disclosed before payment. Use the print function or otherwise export
        anything you need to keep before a project expires. Project owners can also
        delete a project at any time, which is likewise permanent.
      </p>

      <h2>7. Acceptable use</h2>
      <ul>
        <li>No unlawful, infringing, or harmful content or activity.</li>
        <li>No attempting to breach, probe, or overload the Service.</li>
        <li>No uploading of malware or content you lack rights to.</li>
        <li>No use of the Service to harass other users.</li>
      </ul>
      <p>We may suspend or terminate accounts that violate these Terms.</p>

      <h2>8. Third-party services</h2>
      <p>
        The Service is built on third-party infrastructure, including Vercel (hosting
        and file storage), Neon (database), Stripe (payments), OpenAI (translation),
        and Resend (email). Their availability affects ours, and their processing of
        data is described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>9. Disclaimer of warranties</h2>
      <p>
        THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT
        WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR
        PURPOSE, ACCURACY (INCLUDING ACCURACY OF TRANSLATIONS), AND NON-INFRINGEMENT.
        WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT
        DATA WILL NEVER BE LOST. SOME JURISDICTIONS DO NOT ALLOW CERTAIN WARRANTY
        EXCLUSIONS, SO PARTS OF THIS SECTION MAY NOT APPLY TO YOU.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE WILL NOT BE LIABLE FOR INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS,
        DATA, OR BUSINESS, ARISING FROM YOUR USE OF THE SERVICE — INCLUDING RELIANCE ON
        ANY TRANSLATION OR ON CONTENT ENTERED BY ANY USER. OUR TOTAL LIABILITY FOR ANY
        CLAIM IS LIMITED TO THE AMOUNT YOU PAID US IN THE TWELVE MONTHS BEFORE THE
        CLAIM AROSE. NOTHING IN THESE TERMS EXCLUDES LIABILITY THAT CANNOT BE EXCLUDED
        UNDER APPLICABLE LAW, AND NOTHING AFFECTS STATUTORY CONSUMER RIGHTS THAT APPLY
        IN YOUR COUNTRY OF RESIDENCE.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        To the extent permitted by law, you agree to indemnify us against claims
        arising from your content, your use of the Service in violation of these
        Terms, or your violation of applicable law.
      </p>

      <h2>12. Changes and termination</h2>
      <p>
        We may update the Service and these Terms; material changes will be posted on
        this page with a new effective date, and continued use after changes take
        effect constitutes acceptance. You may stop using the Service at any time. We
        may suspend or terminate access for breach of these Terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which the Service
        operator is established, without regard to conflict-of-law rules — except that
        if you are a consumer, you also benefit from any mandatory protections of the
        law of the country where you live, and nothing in these Terms deprives you of
        them or of the right to bring proceedings in your local courts where that
        right cannot be waived.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms: <strong>julianleone@gmail.com</strong>.
      </p>
    </LegalPage>
  );
}
