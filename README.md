# MonthlyAlerts

**MonthlyAlerts.com** — a simple, professional personal health coach delivered through a chat interface. Users receive daily guidance for meals and exercise, and a clear **monthly progress summary** — the core deliverable of the product.

## Monorepo Structure

```
/web      Next.js backend (API routes) + parent & admin web dashboards (deployed on Vercel)
/mobile   React Native + Expo mobile app (chat-first user experience)
```

## Product Overview

- **Chat-first coaching** — the main screen is a clean chat interface with an AI Coach. Only two user actions: **Snap Meal** (camera) and **I Did It** (challenge completion). No free-text input.
- **Exercise system** — sequential challenges (finish one, the next unlocks), bodyweight + dumbbell exercises, progressive overload personalized by performance, age, gender, and date of birth.
- **Nutrition system** — meal photo → GPT-4o vision analysis → short, useful feedback focused on balance. Meal-logging streaks accelerate exercise progression.
- **Monthly summaries** — at the end of each month, a clear report (email + in-app) shows trends in meals logged, challenges completed, streaks, weight changes, and overall improvement.
- **Leaderboards** — invite-only via referrals, max 3 per user, shows active friends (last 7–14 days), goal of 5 friends per leaderboard.
- **Onboarding** — single entry point with an age gate (16+). Under-16 users require parent-managed setup via a secure email link. DOB required for all users.
- **Parent & admin dashboards** — parent web dashboard with profile/goal management, logs, and monthly summary emails (Resend). Admin dashboard with IP-based geolocation analytics.
- **Monetization** — first 30 days free, then a Stripe monthly subscription prompt.
- **Notifications** — max 2–3 smart daily push notifications (meal nudge, challenge, evening check-in).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web / API | Next.js (App Router) on Vercel |
| Mobile | React Native + Expo |
| Database | Neon Postgres |
| AI | OpenAI (GPT-4o-mini for coaching, GPT-4o for meal vision) |
| Email | Resend |
| Payments | Stripe (monthly subscriptions) |

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
