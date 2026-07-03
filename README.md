# MonthlyAlerts

**MonthlyAlerts.com** — a simple, professional personal health coach delivered through a chat interface. Users receive daily guidance for meals and exercise, and a clear **monthly progress summary** — the core deliverable of the product.

## Monorepo Structure

```
/web      Next.js backend (API routes) + parent & admin web dashboards (deployed on Vercel)
/mobile   React Native + Expo mobile app (chat-first user experience)
```

## Product Overview

- **Chat-first coaching** — the main screen is a clean chat interface with an AI Coach. Only two user actions: **Snap Meal** (camera → GPT-4o vision feedback) and **I Did It** (challenge completion). No free-text input.
- **Exercise system** — sequential challenges (finish one, the next unlocks immediately), bodyweight + dumbbell exercises, progressive overload personalized by performance, age, gender, and date of birth.
- **Nutrition system** — meal photo → GPT-4o vision analysis → short, useful feedback focused on balance. Meal-logging streaks accelerate exercise progression.
- **Monthly summaries** — at the end of each month (and on demand), a clear report (email via Resend + in-app) shows trends in meals logged, challenges completed, streaks, weight changes, and overall improvement, with an AI-written narrative.
- **Leaderboards** — invite-only via email referrals, max 3 per user, shows active friends (last 14 days), leave anytime, goal of 5 friends per leaderboard.
- **Onboarding** — single entry point with the 16+ age gate. Under-16 users enter a parent email; the parent receives a secure setup link, completes the child profile, and sets credentials. 16+ users self-sign up (email/password or Apple/Google). DOB required for all users.
- **Parent & admin dashboards** — parent web dashboard with profile/goal management, meal & challenge logs, and on-demand monthly summary emails. Admin dashboard with IP-based geolocation analytics (Vercel edge headers, admin-only).
- **Monetization** — first 30 days free; after an active trial ends, one email prompts the Stripe monthly subscription (Checkout). Webhook keeps status in sync.
- **Notifications** — max 2–3 smart daily pushes (meal nudge ~noon, challenge ~5pm, evening check-in ~8pm, each in the user's timezone).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web / API | Next.js (App Router) on Vercel |
| Mobile | React Native + Expo (expo-router) |
| Database | Neon Postgres |
| AI | OpenAI (GPT-4o-mini for coaching, GPT-4o for meal vision) |
| Email | Resend |
| Payments | Stripe (monthly subscriptions) |
| Photos | Vercel Blob |

## Database

The full schema (20 tables) lives at [`web/db/schema.sql`](web/db/schema.sql).

```bash
cd web
npm run db:migrate   # apply schema
npm run db:wipe      # drop everything, then apply schema (destructive)
```

On Vercel, `POST /api/admin/migrate` (header `x-migrate-secret: $MIGRATE_SECRET`) does the same.

## Scheduled Jobs (Vercel Cron, see web/vercel.json)

| Job | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/monthly-summaries` | 1st of month, 06:00 UTC | Generate + email monthly progress summaries |
| `/api/cron/notifications` | every 2 hours | Smart daily push nudges (capped 3/day) |
| `/api/cron/billing-prompts` | daily 08:30 UTC | Post-trial subscription prompt emails |

## Environment

See [`web/.env.example`](web/.env.example). Required in production: `DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `MIGRATE_SECRET`. Optional: `ADMIN_EMAILS` (auto-promote at signup), `APPLE_BUNDLE_ID` / `GOOGLE_CLIENT_IDS` (mobile OAuth).

To promote an existing account to admin: `cd web && DATABASE_URL=... node scripts/make-admin.mjs you@example.com`

## Development

```bash
# Web (API + dashboards)
cd web && npm install && npm run dev

# Mobile (Expo)
cd mobile && npm install && npm start
```
