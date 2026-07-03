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
- **Nutrition system** — meal photo → GPT-4o vision analysis → short, useful feedback focused on balance. The photo is analyzed inline and never stored; only the structured result is kept. Meal-logging streaks accelerate exercise progression.
- **Progress tracking** — a running, cumulative per-user summary (meals logged, distinct logging days, balanced-meal rate, challenges completed, cumulative volume) is maintained in `O(1)` on each action, so review and goal alignment never require scanning or retaining raw history.
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

> **Meal photos are never stored.** Each photo is sent to the vision model inline (a base64 `data:` URL) for categorization and discarded when the request returns. Only the structured result — coaching feedback, a balance label, and detected items — is persisted, so no image storage service is required.

## Data & Progress Tracking

- **What is kept for review & goal alignment:** structured meal categorization (`meal_logs.ai_feedback` + `meal_logs.ai_analysis`), completed challenges and volume (`challenge_logs`), meal-logging streaks (`streaks`), optional weight history (`weight_entries`), and monthly reports (`monthly_summaries`). No raw images.
- **Running summary (`progress_stats`):** a single always-current row per user accumulates lifetime diet + fitness progress (meals logged, distinct logging days, balanced-meal count/breakdown, challenges completed, cumulative volume). It is updated in `O(1)` on each meal log and challenge completion — accurate and cumulative with minimal storage, and readable at `GET /api/progress`.

## Database

The full schema lives at [`web/db/schema.sql`](web/db/schema.sql).

```bash
cd web
npm run db:migrate   # apply schema
npm run db:wipe      # drop everything, then apply schema (destructive)
```

On Vercel, `POST /api/admin/migrate` (header `x-migrate-secret: $MIGRATE_SECRET`) does the same.

For existing databases, apply the incremental migration in [`web/db/migrations/`](web/db/migrations) (makes `meal_logs.photo_url` optional, adds `progress_stats`, and backfills it) without wiping data.

## Scheduled Jobs (Vercel Cron, see web/vercel.json)

| Job | Schedule | Purpose |
| --- | --- | --- |
| `/api/cron/monthly-summaries` | 1st of month, 06:00 UTC | Generate + email monthly progress summaries |
| `/api/cron/notifications` | every 2 hours | Smart daily push nudges (capped 3/day) |
| `/api/cron/billing-prompts` | daily 08:30 UTC | Post-trial subscription prompt emails |

## Environment

See [`web/.env.example`](web/.env.example). Required in production: `DATABASE_URL`, `OPENAI_API_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `CRON_SECRET`, `MIGRATE_SECRET`. Optional: `APPLE_BUNDLE_ID` / `GOOGLE_CLIENT_IDS` (mobile OAuth).

Admin access is hardcoded to a single account in [`web/lib/admin.ts`](web/lib/admin.ts) — no environment variable and no promotion path exist. Any other account whose database role is somehow set to `admin` is automatically demoted at sign-in.

## Development

```bash
# Web (API + dashboards)
cd web && npm install && npm run dev

# Mobile (Expo)
cd mobile && npm install && npm start
```
