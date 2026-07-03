# MonthlyAlerts

**MonthlyAlerts.com** — a simple, professional personal health coach delivered through a chat interface. Users receive daily guidance for meals and exercise, and a clear **monthly progress summary** — the core deliverable of the product.

## Monorepo Structure

```
/web      Next.js backend (API routes) + parent & admin web dashboards (deployed on Vercel)
/mobile   React Native + Expo mobile app (chat-first user experience)
```

## Product Overview

<<<<<<< HEAD
- **Chat-first coaching** — the main screen is a clean chat interface with an AI Coach. Only two user actions: **Snap Meal** (camera → GPT-4o vision feedback) and **I Did It** (challenge completion). No free-text input.
- **Exercise system** — sequential challenges (finish one, the next unlocks immediately), bodyweight + dumbbell exercises, progressive overload personalized by performance, age, gender, and date of birth.
- **Nutrition system** — meal photo → GPT-4o vision analysis → short, useful feedback focused on balance. Meal-logging streaks accelerate exercise progression.
- **Monthly summaries** — at the end of each month (and on demand), a clear report (email via Resend + in-app) shows trends in meals logged, challenges completed, streaks, weight changes, and overall improvement, with an AI-written narrative.
- **Leaderboards** — invite-only via email referrals, max 3 per user, shows active friends (last 14 days), leave anytime, goal of 5 friends per leaderboard.
- **Onboarding** — single entry point with the 16+ age gate. Under-16 users enter a parent email; the parent receives a secure setup link, completes the child profile, and sets credentials. 16+ users self-sign up (email/password or Apple/Google). DOB required for all users.
- **Parent & admin dashboards** — parent web dashboard with profile/goal management, meal & challenge logs, and on-demand monthly summary emails. Admin dashboard with IP-based geolocation analytics (Vercel edge headers, admin-only).
- **Monetization** — first 30 days free; after an active trial ends, one email prompts the Stripe monthly subscription (Checkout). Webhook keeps status in sync.
- **Notifications** — max 2–3 smart daily pushes (meal nudge ~noon, challenge ~5pm, evening check-in ~8pm, each in the user's timezone).
=======
- **Chat-first coaching** — the main screen is a clean chat interface with an AI Coach. Only two user actions: **Snap Meal** (camera) and **I Did It** (challenge completion). No free-text input.
- **Exercise system** — sequential challenges (finish one, the next unlocks), bodyweight + dumbbell exercises, progressive overload personalized by performance, age, gender, and date of birth.
- **Nutrition system** — meal photo → GPT-4o vision analysis → short, useful feedback focused on balance. Meal-logging streaks accelerate exercise progression.
- **Monthly summaries** — at the end of each month, a clear report (email + in-app) shows trends in meals logged, challenges completed, streaks, weight changes, and overall improvement.
- **Leaderboards** — invite-only via referrals, max 3 per user, shows active friends (last 7–14 days), goal of 5 friends per leaderboard.
- **Onboarding** — single entry point with an age gate (16+). Under-16 users require parent-managed setup via a secure email link. DOB required for all users.
- **Parent & admin dashboards** — parent web dashboard with profile/goal management, logs, and monthly summary emails (Resend). Admin dashboard with IP-based geolocation analytics.
- **Monetization** — first 30 days free, then a Stripe monthly subscription prompt.
- **Notifications** — max 2–3 smart daily push notifications (meal nudge, challenge, evening check-in).
>>>>>>> origin/main

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web / API | Next.js (App Router) on Vercel |
<<<<<<< HEAD
| Mobile | React Native + Expo (expo-router) |
=======
| Mobile | React Native + Expo |
>>>>>>> origin/main
| Database | Neon Postgres |
| AI | OpenAI (GPT-4o-mini for coaching, GPT-4o for meal vision) |
| Email | Resend |
| Payments | Stripe (monthly subscriptions) |
<<<<<<< HEAD
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

See [`web/.env.example`](web/.env.example). Required in production: `DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `MIGRATE_SECRET`. Optional: `APPLE_BUNDLE_ID` / `GOOGLE_CLIENT_IDS` (mobile OAuth).

Admin access is hardcoded to a single account in [`web/lib/admin.ts`](web/lib/admin.ts) — no environment variable and no promotion path exist. Any other account whose database role is somehow set to `admin` is automatically demoted at sign-in.

## Development

```bash
# Web (API + dashboards)
cd web && npm install && npm run dev

# Mobile (Expo)
cd mobile && npm install && npm start
```
=======

## Database

The full schema lives at [`web/db/schema.sql`](web/db/schema.sql).

Apply it locally (requires `DATABASE_URL`):

```bash
cd web
node scripts/migrate.mjs          # apply schema
node scripts/migrate.mjs --wipe   # drop everything, then apply schema
```

On Vercel (where `DATABASE_URL` is injected), the same can be done through the protected endpoint `POST /api/admin/migrate` with the `x-migrate-secret` header (`MIGRATE_SECRET` env var).

## Development

```bash
# Web
cd web
npm install
npm run dev

# Mobile (coming soon)
cd mobile
```
>>>>>>> origin/main
