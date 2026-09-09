import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { appUrl } from "@/lib/email";
import { HARD_DAILY_MAX, outreachAddress, outreachConfigured, outreachEnabled, outreachFromName } from "@/lib/outreach";
import { requireOnboardedUser } from "@/lib/page-auth";
import { SetupCheck } from "./setup-check";

export const dynamic = "force-dynamic";

// Admin-only: how outreach sending works on the product's own domain, what
// protects that domain's reputation, and the two switches to flip.

export default async function ProspectSetupPage() {
  const { user } = await requireOnboardedUser("/admin/prospects/setup");
  if (!isAdmin(user)) notFound();
  const address = outreachAddress();
  const webhook = `${appUrl()}/api/webhooks/resend`;

  const STEPS: { title: string; body: React.ReactNode }[] = [
    {
      title: "1 · How it sends",
      body: (
        <>
          <p>
            Outreach goes out through Resend as <code>{outreachFromName()} &lt;{address}&gt;</code>,
            the same verified domain as invites and password resets. No separate domain, no Gmail
            account. Change the address with <code>OUTREACH_FROM_EMAIL</code> / name with{" "}
            <code>OUTREACH_FROM_NAME</code> (Vercel → Environment Variables → redeploy).
          </p>
          <p className="mt-2">
            Replies and bounces come back to <code>{address}</code> through the domain&apos;s inbound
            MX (already pointed at Resend for support@). They land in{" "}
            <Link href="/admin/inbox" className="underline">/admin/inbox</Link>, are classified for the
            prospect record, and never get the support autoresponder. Replying from the inbox answers
            as {outreachFromName()}, in the same thread.
          </p>
        </>
      ),
    },
    {
      title: "2 · What protects the domain (built in)",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Nothing sends until <code>OUTREACH_ENABLED=true</code>; every draft is approved by you first.</li>
          <li>
            Warm-up ramp 5 → 8 → 12 → your cap per day, weekdays only, and a hard ceiling of{" "}
            {HARD_DAILY_MAX}/day whatever the settings say.
          </li>
          <li>Plain text, under 120 words, personalized from research, one link, no tracking pixels.</li>
          <li>
            One-click unsubscribe (RFC 8058 <code>List-Unsubscribe-Post</code>, the button Gmail shows) plus
            a footer link; unsubscribes and declines are suppressed permanently.
          </li>
          <li>
            A single <strong>spam complaint</strong> pauses all sending and emails you. Bounces over 5% in 7
            days do the same. MX is checked before an address is ever used; existing users and previously
            contacted addresses are skipped.
          </li>
        </ul>
      ),
    },
    {
      title: "3 · Resend: add bounce and complaint events to the webhook",
      body: (
        <>
          <p>
            Resend → Webhooks → the endpoint <code>{webhook}</code> already receives{" "}
            <code>email.received</code>. Edit it and also enable <strong>email.bounced</strong> and{" "}
            <strong>email.complained</strong> (same signing secret, nothing else to change). Without this
            the complaint circuit breaker is blind.
          </p>
        </>
      ),
    },
    {
      title: "4 · DNS: confirm DMARC",
      body: (
        <>
          <p>
            SPF and DKIM for monthlyalerts.com are already set up by Resend. Check the root domain has a
            DMARC record — <code>_dmarc.monthlyalerts.com</code> TXT{" "}
            <code>v=DMARC1; p=none; rua=mailto:julianleone@gmail.com</code> is enough to start; move to{" "}
            <code>p=quarantine</code> after a month of clean reports. Cold email without DMARC alignment is
            the fastest way into Gmail&apos;s spam folder.
          </p>
        </>
      ),
    },
    {
      title: "5 · Switch on and test",
      body: (
        <>
          <p>
            Vercel → Environment Variables (Production): <code>OUTREACH_ENABLED=true</code>, then redeploy.
            Use the check below: send the test to yourself, confirm it lands in Inbox (not Promotions /
            Spam), open &ldquo;Show original&rdquo; and see SPF, DKIM and DMARC all PASS, then reply to it
            and confirm the reply appears in /admin/inbox.
          </p>
        </>
      ),
    },
    {
      title: "6 · Running it without hurting deliverability",
      body: (
        <ul className="list-disc pl-5 space-y-1">
          <li>Keep the daily cap at 15 or below for the first month; volume is not the lever here.</li>
          <li>
            Approve only drafts that reference something real about the company. Delete generic ones —
            a generic email that gets marked spam costs more than ten unsent ones.
          </li>
          <li>Watch the Bounced / Suppressed counts weekly on /admin/prospects. Rising bounces = the email-finding step is guessing; tighten the score threshold.</li>
          <li>
            If sending pauses itself, read the alert before unpausing. Two complaints in a month means stop
            for two weeks and change the targeting, not the wording.
          </li>
          <li>The plan is 250 contacts in Month 2: at 5–15/day on weekdays that is 5–6 weeks. Start early.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}
          <Link href="/admin/prospects" className="hover:text-accent-deep">Prospecting</Link>
          {" / Sending setup"}
        </p>
        <h1 className="display text-5xl mb-3">Outreach sending</h1>
        <p className="text-sm text-ink-soft mb-8 max-w-2xl">
          Status:{" "}
          {outreachConfigured() ? (
            <span className="chip text-ok">enabled · sends as {address}</span>
          ) : outreachEnabled() ? (
            <span className="chip text-accent-deep">enabled but RESEND_API_KEY missing</span>
          ) : (
            <span className="chip text-ink-faint">off — research and drafting run, nothing sends</span>
          )}
        </p>

        <ol className="space-y-8 mb-10">
          {STEPS.map((s) => (
            <li key={s.title} className="sheet p-6">
              <h2 className="display text-xl mb-3">{s.title}</h2>
              <div className="text-sm text-ink-soft leading-relaxed">{s.body}</div>
            </li>
          ))}
        </ol>

        <h2 className="display text-2xl mb-3">Check</h2>
        <SetupCheck envReady={outreachConfigured()} />
      </main>
    </div>
  );
}
