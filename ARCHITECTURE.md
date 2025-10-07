# Website Architecture Template
## MonthlyAlerts.com - SaaS Subscription Platform

This document provides a comprehensive architecture template for replicating this SaaS subscription website. The platform enables subscription-based monthly alerts with Stripe payments, user authentication, and admin dashboard.

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [Payment Integration](#payment-integration)
6. [Email System](#email-system)
7. [Admin Dashboard](#admin-dashboard)
8. [User Dashboard](#user-dashboard)
9. [Environment Variables](#environment-variables)
10. [Deployment Guide](#deployment-guide)
11. [Replication Steps](#replication-steps)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **React**: 19
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Theme**: next-themes (dark mode support)

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: SQL template literals via @neondatabase/serverless
- **Authentication**: Custom session-based auth with bcrypt
- **Payments**: Stripe (Checkout, Subscriptions, Webhooks)
- **Email**: Resend API

### Development Tools
- **TypeScript**: 5
- **Package Manager**: npm (with --legacy-peer-deps)
- **Linting**: ESLint
- **Deployment**: Vercel

---

## Project Structure

```
monthly-alerts/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   ├── alerts.tsx           # Send alert emails
│   │   ├── auth.ts              # Login/signup/logout
│   │   ├── generate-alert.ts    # AI alert generation
│   │   ├── messages.tsx         # Send message emails
│   │   ├── profile.ts           # User profile updates
│   │   ├── send-admin-notification.ts  # New subscriber notifications
│   │   ├── send-subscription-email.ts  # Subscription confirmation
│   │   ├── send-welcome-email.ts       # Welcome emails
│   │   └── subscription.ts      # Subscription management
│   │
│   ├── admin/                   # Admin Dashboard
│   │   ├── alerts/              # View all sent alerts
│   │   ├── messages/            # View all sent messages
│   │   ├── send-alert/          # Compose & send alerts
│   │   ├── send-message/        # Compose & send messages
│   │   ├── subscriptions/       # View all subscriptions
│   │   ├── users/               # View all users
│   │   └── page.tsx             # Admin dashboard home
│   │
│   ├── api/                     # API Routes
│   │   ├── migrate/             # Database migration endpoint
│   │   └── webhooks/
│   │       └── stripe/          # Stripe webhook handler
│   │
│   ├── dashboard/               # User Dashboard
│   │   ├── manage-subscription/ # Cancel subscription
│   │   ├── settings/            # User settings & password
│   │   ├── subscribe/           # Stripe checkout
│   │   ├── alerts-table.tsx     # User's alerts view
│   │   └── page.tsx             # Dashboard home
│   │
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   ├── privacy/                 # Privacy policy
│   ├── terms/                   # Terms of service
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Landing page
│
├── components/                  # React Components
│   ├── ui/                      # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   └── theme-provider.tsx       # Dark mode provider
│
├── lib/                         # Utilities
│   ├── auth.ts                  # Auth helpers
│   ├── env.ts                   # Environment validation
│   ├── stripe.ts                # Stripe client
│   └── utils.ts                 # General utilities
│
├── scripts/                     # Database Scripts
│   ├── 001_create_subscriptions_table.sql
│   ├── 002_create_alerts_table.sql
│   ├── 003_create_admin_users_table.sql
│   ├── 004_create_auth_tables.sql
│   ├── 005_add_admin_user.sql
│   ├── 006_reset_alerts.sql
│   ├── 007_create_messages_table.sql
│   └── 008_add_alert_metadata.sql
│
├── public/                      # Static assets
│   ├── favicon files
│   └── placeholder images
│
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
├── vercel.json                 # Vercel config
├── components.json             # shadcn/ui config
└── README.md                   # Project documentation
```

---

## Database Schema

### Tables

#### 1. `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `sessions`
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `admin_users`
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);
```

#### 4. `subscriptions`
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. `alerts`
```sql
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    ticker VARCHAR(10),
    company_name VARCHAR(200),
    ai_generated BOOLEAN DEFAULT FALSE
);
```

#### 6. `messages`
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    recipient_count INTEGER NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

---

## Authentication System

### Session-Based Authentication
- **Password Hashing**: bcryptjs with 10 salt rounds
- **Session Management**: UUID-based sessions stored in database
- **Cookie**: `session_id` HttpOnly cookie with 30-day expiration
- **Protection**: Admin routes protected by `isAdmin()` check
- **User Routes**: Protected by `getSession()` / `requireAuth()`

### Key Functions (`lib/auth.ts`)

```typescript
// Create session after login
export async function createSession(userId: string)

// Get current session
export async function getSession()

// Require authentication (throws if not logged in)
export async function requireAuth()

// Delete session (logout)
export async function deleteSession()
```

### Server Actions (`app/actions/auth.ts`)

```typescript
// User signup
export async function signup(formData: FormData)

// User login
export async function login(formData: FormData)

// User logout
export async function logout()
```

---

## Payment Integration

### Stripe Configuration

**Product Setup:**
- Monthly subscription product
- Price: $29.99/month + tax
- Automatic tax collection enabled
- Recurring billing

**Checkout Flow:**
1. User clicks "Subscribe" → Creates Stripe Checkout session
2. User completes payment → Redirects to dashboard with success
3. Stripe webhook processes `checkout.session.completed`
4. Subscription record created in database
5. Confirmation emails sent (user + admin)

### Webhook Events Handled

```typescript
// app/api/webhooks/stripe/route.ts

1. checkout.session.completed
   - Create subscription record
   - Send confirmation emails
   - Send admin notification

2. customer.subscription.updated
   - Update subscription status
   - Exclude admin users from updates

3. customer.subscription.deleted
   - Mark subscription as cancelled
   - Exclude admin users

4. invoice.payment_succeeded
   - Reactivate subscription
   - Exclude admin users

5. invoice.payment_failed
   - Mark as past_due
   - Exclude admin users
```

**Important**: Admin users are excluded from all Stripe webhook updates to maintain their permanent "active" status.

---

## Email System

### Resend API Integration

All emails use Resend API with consistent branding and disclaimer.

**Email Types:**

1. **Welcome Email** (`send-welcome-email.ts`)
   - Sent on user registration
   - No subscription required

2. **Subscription Confirmation** (`send-subscription-email.ts`)
   - Sent after successful Stripe checkout
   - Confirms active subscription

3. **Admin Notification** (`send-admin-notification.ts`)
   - Sent to all admins when new user subscribes
   - Includes subscriber details and metadata

4. **Monthly Alerts** (`alerts.tsx`)
   - Sent to all active subscribers + admins
   - AI-generated stock analysis content

5. **Custom Messages** (`messages.tsx`)
   - Admin-composed messages to subscribers

**Email Template Structure:**
- Responsive HTML design
- Consistent branding
- Unsubscribe headers
- Legal disclaimer
- From: `MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>`

---

## Admin Dashboard

### Features

1. **Statistics Overview** (`/admin`)
   - Total users
   - Active subscriptions
   - Alerts sent
   - Messages sent

2. **User Management** (`/admin/users`)
   - View all users with pagination
   - See admin/user roles
   - Subscription status
   - Registration dates

3. **Subscription Management** (`/admin/subscriptions`)
   - View active subscriptions
   - Display status: Admin / Active / Cancelling
   - Monthly revenue calculation
   - Subscriber details

4. **Alert Management** (`/admin/alerts`)
   - View all sent alerts
   - See recipient counts
   - Delete alerts

5. **Message Management** (`/admin/messages`)
   - View all sent messages
   - See recipient counts
   - Delete messages

6. **Send Alert** (`/admin/send-alert`)
   - AI-powered alert generation (OpenAI)
   - Manual composition
   - Preview before sending
   - Sends to all active subscribers + admins

7. **Send Message** (`/admin/send-message`)
   - Compose custom messages
   - Subject + content
   - Sends to all active subscribers + admins

### Admin Privileges

- Admin status prevents Stripe from updating subscription
- Admin always shows "Admin" status (not "Active")
- Access to all admin routes
- Can view all user data
- Can send alerts and messages

---

## User Dashboard

### Features

1. **Dashboard Home** (`/dashboard`)
   - Welcome message
   - Subscription status
   - Quick access to all features

2. **Alerts View** (`/dashboard`)
   - Table of received alerts
   - View subject, date sent
   - Paginated display
   - Free users see limited alerts

3. **Subscription Management** (`/dashboard/subscribe`)
   - Subscribe via Stripe Checkout
   - One-click subscription button

4. **Cancel Subscription** (`/dashboard/manage-subscription`)
   - Cancel at any time
   - Access until period end
   - Stripe-powered cancellation

5. **Settings** (`/dashboard/settings`)
   - Update name
   - Update email
   - Change password
   - Profile management

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend (Email)
RESEND_API_KEY=re_xxx

# OpenAI (Optional - for AI alert generation)
OPENAI_API_KEY=sk-xxx

# App URL
NEXT_PUBLIC_URL=https://yourapp.com
```

### Environment Validation

The `lib/env.ts` file validates all required environment variables at build time.

---

## Deployment Guide

### Vercel Deployment

1. **Connect Repository**
   - Link GitHub repo to Vercel
   - Auto-deploys on push to main

2. **Environment Variables**
   - Add all env vars in Vercel dashboard
   - Keep STRIPE_WEBHOOK_SECRET for webhook endpoint

3. **Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "installCommand": "npm install --legacy-peer-deps"
   }
   ```

4. **Database Setup**
   - Use Neon PostgreSQL (serverless)
   - Run migration scripts in order
   - Create admin user with script 005

5. **Stripe Webhook Configuration**
   - Add webhook endpoint: `https://yourapp.com/api/webhooks/stripe`
   - Select events: checkout.session.completed, customer.subscription.*, invoice.*
   - Copy webhook secret to env vars

6. **DNS Configuration**
   - Point domain to Vercel
   - Add custom domain in Vercel dashboard

---

## Replication Steps

### 1. Initial Setup

```bash
# Clone or create new Next.js project
npx create-next-app@latest my-saas-app --typescript --tailwind --app

# Install dependencies
npm install --legacy-peer-deps @neondatabase/serverless stripe resend bcryptjs openai
npm install --legacy-peer-deps @radix-ui/react-label @radix-ui/react-slot
npm install --legacy-peer-deps lucide-react class-variance-authority clsx tailwind-merge
npm install --legacy-peer-deps -D @types/bcryptjs

# Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input label textarea badge
```

### 2. Copy Core Files

Copy the following from this repository:
- `app/` directory structure
- `lib/` utilities
- `components/` folder
- `scripts/` SQL files
- Configuration files (tsconfig.json, next.config.mjs, etc.)

### 3. Database Setup

```bash
# Create Neon database
# Get connection string
# Add to .env.local

# Run migrations in order
psql $DATABASE_URL -f scripts/001_create_subscriptions_table.sql
psql $DATABASE_URL -f scripts/002_create_alerts_table.sql
# ... continue with all scripts
```

### 4. Stripe Setup

```bash
# Create Stripe account
# Create product ($29.99/month subscription)
# Enable automatic tax
# Get API keys
# Add to .env.local
# Configure webhook endpoint
```

### 5. Email Setup

```bash
# Create Resend account
# Verify domain
# Get API key
# Add to .env.local
```

### 6. Create Admin User

```sql
-- Run after creating your first user account
INSERT INTO admin_users (user_id) 
VALUES ('your-user-uuid-here');
```

### 7. Deploy

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO
git push -u origin main

# Deploy to Vercel
# Connect repo in Vercel dashboard
# Add environment variables
# Deploy
```

### 8. Post-Deployment

- Test signup flow
- Test subscription flow
- Test admin dashboard
- Test Stripe webhooks
- Send test alert
- Verify emails

---

## Key Design Patterns

### 1. Server Actions
All data mutations use Next.js Server Actions for type safety and security.

### 2. Session Management
Custom session system using database-stored sessions and HttpOnly cookies.

### 3. Subscription Status
Admin users bypass Stripe status updates to maintain permanent access.

### 4. Email Templating
Consistent HTML email templates with responsive design.

### 5. Error Handling
Try-catch blocks with console logging for debugging without breaking user flow.

### 6. Pagination
Admin tables use URL-based pagination for scalability.

### 7. Type Safety
TypeScript throughout with proper type definitions.

---

## Security Considerations

1. **Password Security**: Bcrypt with 10 rounds
2. **Session Security**: HttpOnly cookies, 30-day expiration
3. **Environment Variables**: Never commit .env files
4. **Webhook Security**: Stripe signature verification
5. **SQL Injection**: Parameterized queries via template literals
6. **CSRF Protection**: Next.js built-in protection
7. **Admin Routes**: Server-side authentication checks
8. **Payment Security**: All payment through Stripe (PCI compliant)

---

## Performance Optimizations

1. **Database**: Neon serverless autoscaling
2. **Edge Runtime**: Vercel edge functions
3. **Static Pages**: Landing page statically generated
4. **Image Optimization**: Next.js Image component
5. **Code Splitting**: Automatic via Next.js
6. **Caching**: Stripe webhooks processed asynchronously

---

## Customization Guide

### Branding
1. Update logo in `public/`
2. Update company name in all pages
3. Update email templates
4. Update color scheme in `globals.css`
5. Update meta tags in `layout.tsx`

### Pricing
1. Update Stripe product price
2. Update pricing on landing page
3. Update email copy

### Features
1. Add new pages in `app/` directory
2. Add new server actions in `app/actions/`
3. Add new database tables via migration scripts
4. Update admin dashboard with new sections

---

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Use `npm install --legacy-peer-deps`
   - Check TypeScript errors

2. **Stripe Webhooks Not Working**
   - Verify webhook secret
   - Check Vercel logs
   - Test with Stripe CLI locally

3. **Email Not Sending**
   - Verify Resend API key
   - Check domain verification
   - Review Resend dashboard logs

4. **Session Issues**
   - Clear cookies
   - Check database session records
   - Verify DATABASE_URL

5. **Admin Access Issues**
   - Verify user in admin_users table
   - Check session authentication

---

## Maintenance

### Regular Tasks

1. **Database Backups**: Set up automated Neon backups
2. **Monitoring**: Enable Vercel analytics
3. **Error Tracking**: Integrate Sentry or similar
4. **Security Updates**: Keep dependencies updated
5. **Stripe Dashboard**: Monitor subscriptions and revenue

### Scaling Considerations

1. **Database**: Neon autoscales, upgrade plan as needed
2. **Vercel**: Upgrade plan for more bandwidth
3. **Email**: Resend scales automatically
4. **Stripe**: No scaling needed

---

## Support & Documentation

- Next.js: https://nextjs.org/docs
- Stripe: https://stripe.com/docs
- Resend: https://resend.com/docs
- Neon: https://neon.tech/docs
- shadcn/ui: https://ui.shadcn.com

---

## License & Attribution

This architecture template is designed for MonthlyAlerts.com and can be replicated for similar SaaS subscription platforms.

**Created**: 2025  
**Stack**: Next.js 15 + TypeScript + Stripe + PostgreSQL  
**Pattern**: SaaS Subscription Platform with Admin Dashboard

---

*End of Architecture Template*

