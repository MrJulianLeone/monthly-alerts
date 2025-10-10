# Switching Stripe from Test to Live Mode

## ⚠️ Important Checklist Before Going Live

- [ ] Stripe account is fully verified
- [ ] Bank account is connected for payouts
- [ ] Business details are complete
- [ ] You've tested subscriptions in test mode
- [ ] Webhook endpoints are configured
- [ ] You understand Stripe fees (2.9% + $0.30 per transaction)

## Step 1: Get Your Live Stripe Keys

1. **Log into Stripe Dashboard**
   - Go to: https://dashboard.stripe.com

2. **Switch to Live Mode**
   - Toggle the switch in the top-right corner from "Test" to "Live"
   - You may need to activate your account first

3. **Get Your API Keys**
   - Go to: Developers → API keys
   - Copy these keys:
     - **Publishable key** (starts with `pk_live_...`)
     - **Secret key** (starts with `sk_live_...`) - Click "Reveal live key token"

## Step 2: Update Environment Variables

### Local Development (.env.local)

Update your `.env.local` file:

```bash
# Stripe Live Keys
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

**⚠️ Keep your test keys as backup:**
```bash
# Stripe Test Keys (backup - keep these commented)
# STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
# STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
```

### Production (Vercel)

Update environment variables in Vercel:

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Update these variables:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
3. Click "Save"
4. **Redeploy** your application

## Step 3: Set Up Live Webhook

### Get Your Production URL

Your production URL is likely:
- `https://monthlyalerts.com` or
- `https://your-project.vercel.app`

### Create Webhook Endpoint in Stripe

1. **Go to Stripe Webhooks**
   - https://dashboard.stripe.com/webhooks (make sure you're in **Live mode**)

2. **Add Endpoint**
   - Click "+ Add endpoint"
   - Endpoint URL: `https://monthlyalerts.com/api/webhooks/stripe`
   - Description: "MonthlyAlerts Production Webhook"

3. **Select Events to Listen To**
   Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. **Copy the Signing Secret**
   - After creating, click on the webhook
   - Click "Reveal" on the "Signing secret"
   - Copy the secret (starts with `whsec_...`)

### Add Webhook Secret to Environment

**Local (.env.local):**
```bash
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

**Production (Vercel):**
1. Add environment variable: `STRIPE_WEBHOOK_SECRET`
2. Value: `whsec_YOUR_LIVE_WEBHOOK_SECRET`
3. Save and redeploy

## Step 4: Test in Production

### Test with Real Card (Small Amount)

1. **Subscribe with a real card**
   - Use your own card
   - Complete a real subscription ($29.99 + tax)

2. **Verify in Stripe Dashboard**
   - Go to: https://dashboard.stripe.com/subscriptions (Live mode)
   - You should see the subscription

3. **Verify in Your Database**
   ```sql
   SELECT * FROM subscriptions 
   WHERE stripe_subscription_id LIKE 'sub_%' 
   ORDER BY created_at DESC LIMIT 1;
   ```

4. **Test Cancellation**
   - Go to your dashboard
   - Cancel the subscription
   - Verify it shows "Cancels at [end date]" in Stripe

5. **Test Webhook**
   - Check Stripe webhook logs: https://dashboard.stripe.com/webhooks
   - Should show successful webhook deliveries

### Refund Your Test Transaction (Optional)

If you want your money back from testing:
1. Go to Stripe Dashboard → Payments
2. Find your test payment
3. Click "Refund"

## Step 5: Monitor and Verify

### Check Webhook Logs

https://dashboard.stripe.com/webhooks
- Should show successful deliveries (200 responses)
- If any fail (400, 500), check your logs

### Check Your Application Logs

If deployed on Vercel:
```bash
vercel logs --follow
```

Look for:
- `[v0] Received Stripe webhook event:`
- `[Webhook] Subscription record created`
- Any errors

## Rollback to Test Mode (If Needed)

If something goes wrong, you can quickly rollback:

1. **Update .env.local and Vercel**
   - Change back to `sk_test_...` and `pk_test_...` keys
   - Update webhook secret to test webhook secret

2. **Redeploy**
   ```bash
   vercel --prod
   ```

## Common Issues

### Issue: Webhook Returns 401/500
**Fix:** Check that `STRIPE_WEBHOOK_SECRET` matches your live webhook secret

### Issue: Subscriptions Not Appearing in Database
**Fix:** Check webhook logs in Stripe. Ensure events are being sent and received.

### Issue: Customers Can't Subscribe
**Fix:** 
- Check browser console for errors
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Ensure you're using the live publishable key

### Issue: Test Cards Still Work
**Fix:** You're still in test mode. Double-check your API keys start with `sk_live_` and `pk_live_`

## Security Checklist

- [ ] Never commit live API keys to git
- [ ] `.env.local` is in `.gitignore`
- [ ] Only store live keys in Vercel environment variables
- [ ] Webhook secret is properly configured
- [ ] SSL/HTTPS is enabled on your domain

## Pricing & Fees

### Stripe Fees (Standard)
- **2.9% + $0.30** per successful transaction
- For $29.99 subscription = $1.17 fee, you receive $28.82

### Your Subscription
- Customer pays: **$29.99/month + local taxes**
- Stripe fee: **~$1.17**
- You receive: **~$28.82**
- Taxes are collected and remitted by Stripe (with automatic tax enabled)

## Next Steps After Going Live

1. **Monitor First Few Subscriptions**
   - Watch webhook logs
   - Verify database entries
   - Test cancellations

2. **Set Up Stripe Radar** (Fraud Prevention)
   - https://dashboard.stripe.com/radar/rules
   - Review default rules

3. **Configure Email Receipts**
   - https://dashboard.stripe.com/settings/emails
   - Customize customer receipt emails

4. **Set Up Billing Portal** (Optional)
   - Allows customers to manage their subscriptions directly in Stripe
   - https://dashboard.stripe.com/settings/billing/portal

## Support

If you encounter issues:
- **Stripe Support**: https://support.stripe.com
- **Stripe Logs**: https://dashboard.stripe.com/logs
- **Your Application Logs**: Check Vercel logs

## Quick Command Reference

```bash
# Check current Stripe mode
grep STRIPE_SECRET_KEY .env.local

# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# View Vercel logs
vercel logs --follow

# Redeploy to Vercel
vercel --prod
```

## Checklist Summary

- [ ] Get live Stripe API keys
- [ ] Update `.env.local` with live keys
- [ ] Update Vercel environment variables
- [ ] Create live webhook endpoint in Stripe
- [ ] Add webhook secret to environment
- [ ] Redeploy application
- [ ] Test with real card
- [ ] Verify subscription in Stripe Dashboard
- [ ] Verify subscription in database
- [ ] Test cancellation flow
- [ ] Monitor webhook logs
- [ ] Refund test transaction (optional)

---

**You're ready to go live!** 🚀

