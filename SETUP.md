# MonthlyAlerts.com Setup Guide

## Overview
MonthlyAlerts.com is a stock newsletter platform that uses AI to identify fast-growing companies and sends monthly email alerts to subscribers.

## Prerequisites
- Neon database (already connected)
- Stripe account (already connected)
- Resend account for sending emails

## Database Setup

1. Run the SQL scripts in order to create the necessary tables:
   - `scripts/001_create_subscriptions_table.sql`
   - `scripts/002_create_alerts_table.sql`
   - `scripts/003_create_admin_users_table.sql`
   - `scripts/004_create_auth_tables.sql`

2. Add your admin user:
   - `scripts/005_add_admin_user.sql`

## Environment Variables

Required environment variables (most are already set):

\`\`\`env
# Database (Neon) - Already configured
DATABASE_URL=
POSTGRES_URL=

# Payments (Stripe) - Already configured
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Stripe Webhooks - NEEDS TO BE ADDED
STRIPE_WEBHOOK_SECRET=

# Email (Resend) - NEEDS TO BE ADDED
RESEND_API_KEY=

# App URL - NEEDS TO BE ADDED
NEXT_PUBLIC_URL=https://your-domain.com
\`\`\`

## Stripe Configuration

### Create Subscription Product

1. Go to Stripe Dashboard → Products
2. Create a new product: "MonthlyAlerts Subscription"
3. Set price: $29/month (recurring)
4. Copy the Price ID (starts with `price_`)
5. Update `app/actions/subscription.ts` with your Price ID

### Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret and add it as `STRIPE_WEBHOOK_SECRET`

## Resend Setup

1. Sign up at https://resend.com
2. Verify your domain or use test domain
3. Create an API key
4. Add as `RESEND_API_KEY` environment variable
5. Update the "from" email in `app/admin/send-alert/page.tsx`

## Admin Access

Admin access is granted via the `admin_users` table. To add an admin:

1. Create an account on the site first
2. Run the SQL script: `scripts/005_add_admin_user.sql`
3. Access admin dashboard at `/admin`

## Features

### User Features
- Sign up and login with secure authentication
- Subscribe to monthly alerts via Stripe ($29/month)
- View subscription status and billing details
- Update profile information (name, email)
- Cancel subscription anytime
- View received alerts in dashboard

### Admin Features
- Monitor user growth and revenue metrics
- View subscription statistics and charts
- Compose and send monthly alerts to all active subscribers
- View alert history and delivery status

## Mobile-First Design
The entire site is optimized for mobile devices, especially iPhone screens, with responsive layouts that work seamlessly on all screen sizes.

## Disclaimer
The site includes prominent disclaimers that this is not investment advice, as required for financial content.
