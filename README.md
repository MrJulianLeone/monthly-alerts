# MonthlyAlerts.com

AI-powered stock newsletter platform that sends monthly alerts about fast-growing companies to subscribers.

## 🚀 Live Site

- **Production**: [https://monthlyalerts.com](https://monthlyalerts.com)
- **Admin Dashboard**: [https://monthlyalerts.com/admin](https://monthlyalerts.com/admin)

## 📋 Features

- **Landing Page** - Professional marketing site with pricing
- **User Authentication** - Secure signup/login with bcrypt password hashing
- **Stripe Integration** - $29/month recurring subscriptions
- **Email Alerts** - Send monthly stock alerts via Resend
- **Admin Dashboard** - Manage subscribers and send alerts
- **Mobile-First Design** - Responsive UI with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Neon (PostgreSQL)
- **Payments**: Stripe
- **Email**: Resend
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## 🔧 Environment Variables

Required in Vercel dashboard or `.env.local`:

```env
# Database
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_URL=https://monthlyalerts.com
```

## 📦 Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run development server
npm run dev

# Build for production
npm run build
```

## 🗄️ Database Setup

Run SQL scripts in order in your Neon dashboard:

1. `scripts/004_create_auth_tables.sql` - Users & sessions
2. `scripts/001_create_subscriptions_table.sql` - Subscriptions
3. `scripts/002_create_alerts_table.sql` - Alert history
4. `scripts/003_create_admin_users_table.sql` - Admin access
5. `scripts/005_add_admin_user.sql` - Add your admin email

## 🎯 Stripe Setup

1. Create product in [Stripe Dashboard](https://dashboard.stripe.com/products)
   - Name: "MonthlyAlerts Subscription"
   - Price: $29/month recurring

2. Set up webhook at [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - URL: `https://monthlyalerts.com/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`

## 📧 Resend Setup

1. Sign up at [Resend](https://resend.com)
2. Verify domain: `monthlyalerts.com`
3. Create API key
4. Add to environment variables

## 👨‍💼 Admin Access

1. Sign up for an account at [monthlyalerts.com/signup](https://monthlyalerts.com/signup)
2. Run SQL to grant admin access:
   ```sql
   INSERT INTO admin_users (user_id)
   SELECT id FROM users WHERE email = 'your-email@example.com';
   ```
3. Access admin dashboard at [monthlyalerts.com/admin](https://monthlyalerts.com/admin)

## 🚢 Deployment

Automatic deployment via Vercel:

```bash
git push origin main
```

Or manual deployment:

```bash
vercel --prod
```

## 📄 License

Private - All rights reserved © 2025 MonthlyAlerts.com
