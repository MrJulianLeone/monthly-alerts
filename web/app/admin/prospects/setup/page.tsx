import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { outreachConfigured } from "@/lib/outreach";
import { requireOnboardedUser } from "@/lib/page-auth";
import { SetupCheck } from "./setup-check";

export const dynamic = "force-dynamic";

// Admin-only: the full walkthrough for connecting the outreach Gmail
// mailbox. Cold outreach must NEVER go through Resend or the main domain —
// the whole point of this setup is isolating outreach deliverability from
// transactional email.

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "1 · Buy a separate outreach domain (~$10/yr)",
    body: (
      <>
        <p>
          Something close to the brand, e.g. <code>getmonthlyalerts.com</code> or{" "}
          <code>trymonthlyalerts.com</code>. Stick to .com, no hyphens. Set the domain root to
          redirect to monthlyalerts.com — prospects who type it in should land somewhere real, and
          spam filters check.
        </p>
        <p className="mt-2 font-medium">
          Never use monthlyalerts.com itself: spam complaints on cold outreach would damage the
          domain your password resets and invites send from.
        </p>
      </>
    ),
  },
  {
    title: "2 · Google Workspace on that domain (~$8/mo)",
    body: (
      <p>
        Sign up at workspace.google.com (Business Starter) with the new domain, verify it via the
        TXT record they give you, and create one mailbox — e.g.{" "}
        <code>julian@getmonthlyalerts.com</code>. A founder&apos;s name converts better than
        hello@.
      </p>
    ),
  },
  {
    title: "3 · DNS authentication (SPF, DKIM, DMARC — all three are mandatory)",
    body: (
      <>
        <p>In the registrar&apos;s DNS panel for the outreach domain:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>SPF</strong> — TXT record on the root:{" "}
            <code>v=spf1 include:_spf.google.com ~all</code>
          </li>
          <li>
            <strong>DKIM</strong> — Workspace Admin → Apps → Google Workspace → Gmail →
            Authenticate email → generate the key, add the TXT record it shows, then click
            &ldquo;Start authentication&rdquo;.
          </li>
          <li>
            <strong>DMARC</strong> — TXT record on <code>_dmarc</code>:{" "}
            <code>v=DMARC1; p=none; rua=mailto:you@the-outreach-domain</code> (tighten to{" "}
            <code>p=quarantine</code> after a month of clean reports).
          </li>
        </ul>
        <p className="mt-2">
          Verify: email a Gmail account you own, open ⋮ → Show original, and confirm SPF, DKIM,
          and DMARC all say PASS.
        </p>
      </>
    ),
  },
  {
    title: "4 · Google Cloud project + OAuth client",
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li>
          At console.cloud.google.com, signed in as the Workspace account: create a project and
          enable the <strong>Gmail API</strong>.
        </li>
        <li>
          OAuth consent screen: choose <strong>Internal</strong>. This matters — Internal apps skip
          Google&apos;s verification and their refresh tokens don&apos;t expire after 7 days the
          way external test-mode tokens do.
        </li>
        <li>
          Credentials → Create OAuth client ID → type <strong>Web application</strong> → add
          redirect URI <code>http://localhost:8765/callback</code>.
        </li>
        <li>Note the client ID and client secret.</li>
      </ul>
    ),
  },
  {
    title: "5 · Mint the refresh token (one-time, on your laptop)",
    body: (
      <>
        <p>From the repo&apos;s web/ directory:</p>
        <pre className="bg-sheet border-[1.5px] border-line-strong p-3 mt-2 overflow-x-auto text-xs">
          {`OUTREACH_GOOGLE_CLIENT_ID=... \\
OUTREACH_GOOGLE_CLIENT_SECRET=... \\
node scripts/gmail-token.mjs`}
        </pre>
        <p className="mt-2">
          It prints a consent URL — open it, sign in <strong>as the outreach mailbox</strong> (not
          your personal account), approve, and the refresh token prints in the terminal.
        </p>
      </>
    ),
  },
  {
    title: "6 · Environment variables in Vercel",
    body: (
      <>
        <p>Project → Settings → Environment Variables (Production):</p>
        <pre className="bg-sheet border-[1.5px] border-line-strong p-3 mt-2 overflow-x-auto text-xs">
          {`OUTREACH_GOOGLE_CLIENT_ID=...
OUTREACH_GOOGLE_CLIENT_SECRET=...
OUTREACH_GOOGLE_REFRESH_TOKEN=...
OUTREACH_FROM_NAME=Julian   # optional; the From display name + sign-off`}
        </pre>
        <p className="mt-2">Redeploy, then use the connection check below.</p>
      </>
    ),
  },
  {
    title: "7 · Warm up before real outreach (weeks 1–3)",
    body: (
      <>
        <p>
          A new domain + mailbox has zero reputation; jumping straight to volume lands in spam.
          For the first week, use the mailbox by hand: email accounts you own and reply back,
          subscribe to a couple of industry newsletters, send a few real one-off emails.
        </p>
        <p className="mt-2">
          The pipeline then ramps automatically — 5/day in week one of sending, 8 in week two, 12
          in week three, then your configured cap. Keep an eye on the bounce stat: the pipeline
          pauses itself if the 7-day bounce rate crosses 5%.
        </p>
      </>
    ),
  },
];

export default async function ProspectSetupPage() {
  const { user } = await requireOnboardedUser("/admin/prospects/setup");
  if (!isAdmin(user)) notFound();

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}
          <Link href="/admin/prospects" className="hover:text-accent-deep">Prospecting</Link>
          {" / Gmail setup"}
        </p>
        <h1 className="display text-5xl mb-4">Gmail setup</h1>
        <p className="text-sm text-ink-soft mb-8">
          Outreach sends from a dedicated Google Workspace mailbox on a separate domain — never
          from Resend or monthlyalerts.com. Total cost ≈ $18/mo. Do the steps in order; the
          pipeline queues emails safely until the connection works.
        </p>

        <div className="mb-10">
          <SetupCheck envReady={outreachConfigured()} />
        </div>

        <div className="space-y-8">
          {STEPS.map((s) => (
            <section key={s.title}>
              <h2 className="display text-xl border-b-2 border-ink pb-2 mb-3">{s.title}</h2>
              <div className="text-sm text-ink-soft leading-relaxed">{s.body}</div>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="display text-xl border-b-2 border-ink pb-2 mb-3">How replies work</h2>
          <p className="text-sm text-ink-soft leading-relaxed">
            The daily run polls the mailbox: bounces suppress the address automatically, and
            replies are classified (interested / not now / no / unsubscribe / out-of-office) with
            the right action taken. Interested replies email you immediately — answer them
            yourself from the outreach mailbox; it&apos;s a normal Gmail thread. Every outreach
            email carries a one-click unsubscribe link and your postal address should be in the
            signature you configure in the drafts (CAN-SPAM requires both).
          </p>
        </section>
      </main>
    </div>
  );
}
