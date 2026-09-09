# MonthlyAlerts.com

Multilingual construction checklists. A project owner sets up a punch list once;
everyone on the job — subs, inspectors, crew — works the same list in their own
language. All user-written content (items, sections, comments) is stored in the
author's language and translated automatically (GPT-4o-mini, cached
content-addressed in Postgres) for each viewer. Every member gets a monthly
status email in their language.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind 4) in [`web/`](web)
- **Neon Postgres** — raw SQL via `@neondatabase/serverless`, schema in
  [`web/db/schema.sql`](web/db/schema.sql)
- **Resend** — email verification, password resets, invitations, monthly status emails
- **OpenAI** — content translation
- **Vercel Blob** — item photo attachments and the per-project PDF file cabinet
- **Stripe** — one-time per-project fee (`BILLING_ENABLED=true`); projects start as free drafts and are activated at checkout or with credits
- Deployed on **Vercel** (cron in [`web/vercel.json`](web/vercel.json))

## Model

- Passwordless auth: magic links double as email confirmation. First login
  collects name/company/phone and preferred language before anything is usable.
- Roles per project: **owner** (everything, pays for the project), **editor**
  (add/edit/check off, photos, files), **commenter** (view + comment). "Owner" is a
  per-project role — any user can create their own project.
- Checklist = sections (construction phases) → items (status, assignee, due
  date, photos, comments).
- Languages: English and Italian at launch (`web/lib/i18n.ts` is the single
  place to add more).

## Setup

```
cd web
npm install
cp .env.example .env   # fill in keys
npm run db:migrate     # apply db/schema.sql
npm run dev
```

`npm run db:wipe` drops and recreates the schema (destructive). In production,
`POST /api/admin/migrate` (Bearer `MIGRATE_SECRET`, body `{"wipe": true}` to
reset) does the same without local DB access.

## Marketing plan (Sept 2026)

The customer-acquisition plan lives as the "Marketing Plan" checklist project in
the app (owner julianleone@gmail.com); operational playbooks are in
[`marketing/`](marketing) (Google Ads, Meta ads, social calendar, contractor
outreach, Italy partners, KPI definitions). What the app implements:

- **Try before you pay**: with billing on, a new project is a free *draft* for
  30 days (`projects.draft_expires_at`): build the checklist, preview it in every
  language, preview the monthly report at `/projects/[id]/report`, then activate
  (`POST /api/projects/[id]/activate` → Stripe Checkout, or instant when credits
  cover the fee). Drafts hold invitations (`invites.held`, emailed on
  activation), get no monthly report, and are deleted by the daily cron after a
  reminder email 3 days out. Max 3 open drafts per user.
- **Public templates & guides** (SEO): `/checklists/[slug]` (6 phase-by-phase
  templates, `web/lib/content/templates.ts`) and `/guides/[slug]` (17 articles,
  `guides-italy.ts` / `guides-us.ts`), English-only; "Start a project from this
  template" copies sections/items in English (`lib/content/apply.ts`) and the
  app translates per viewer. `/demo` renders one template in EN/IT/ES live.
  `/renovating-in-italy` is the Italy campaign landing page (EN/IT/ES).
- **Referral program**: `monthlyalerts.com/CODE` → `/r/CODE` sets a 90-day
  cookie; signup stores `users.referred_by_code`; activation credits the
  referrer $20 (`credit_ledger`), and credits auto-redeem once they cover a full
  fee. The claim UI in Settings is gated by `REFERRALS_ENABLED=true` (planned
  Month 3); attribution and credits already run. Admin view: `/admin/referrals`,
  which also comps projects ("try your next project on us"). Outreach prospects
  who sign up via their `/w/<token>` link get the comp automatically.
- **Attribution & KPIs**: first-touch `utm_*`/`gclid`/`fbclid`/landing captured
  client-side (`components/attribution-capture.tsx`) and snapshotted on
  `users.acquisition` / `projects.acquisition`; channel buckets in
  `lib/attribution.ts`; `/admin/kpis` shows monthly funnel, per-channel
  activations, spend (entered there) and CAC vs. the plan's targets.
- **Conversion events** (`lib/analytics.ts`): signup, project_created,
  template_used, checkout_started, project_activated → Vercel Analytics, plus
  Google Ads / Meta when `NEXT_PUBLIC_GOOGLE_ADS_ID` / `NEXT_PUBLIC_META_PIXEL_ID`
  are set (tags load on public pages only; disclosed in /privacy).
- **Trust**: item edits snapshot the previous wording (`item_revisions`, shown
  as "Edit history" on the item page); translation disclosure on checklists,
  items, /demo and in the Terms.

## Operations

- **Errors**: Sentry (set `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`); branded
  boundaries in `web/app/error.tsx` / `global-error.tsx` / `not-found.tsx`.
- **Analytics**: Vercel Web Analytics (`<Analytics/>` in the root layout;
  enable in the Vercel dashboard).
- **Support inbox**: mail to support@monthlyalerts.com → Resend inbound →
  `/api/webhooks/resend` → AI triage (spam quarantine / auto-reply / admin
  alert) → `/admin/inbox`.
- **Privacy & deletion requests** (promised in /privacy — respond within the
  legally required window, typically 30 days): verify the request came from
  the account's own email address (the support thread shows the sender);
  delete the user's photos and files from Vercel Blob, then
  `UPDATE users SET deleted_at = now()` plus removal of personal fields, or
  hard-delete the row (cascades to sessions/memberships/comments). Reply
  confirming completion from the admin inbox. Data export: send the user's
  rows (users, their projects/items/comments) as JSON.
