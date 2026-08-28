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
- **Resend** — magic-link sign-in, invitations, monthly status emails
- **OpenAI** — content translation
- **Vercel Blob** — item photo attachments
- **Stripe** — per-project fee, dormant until `BILLING_ENABLED=true`
- Deployed on **Vercel** (cron in [`web/vercel.json`](web/vercel.json))

## Model

- Passwordless auth: magic links double as email confirmation. First login
  collects name/company/phone and preferred language before anything is usable.
- Roles per project: **owner** (everything, pays for the project), **editor**
  (add/edit/check off, photos), **commenter** (view + comment). "Owner" is a
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
