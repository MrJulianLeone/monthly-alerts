# Final Webhook Setup

## ✅ Your Webhook Configuration

**Webhook ID:** `we_1SGegQIg8foNZBNgAA1MGXas`  
**Endpoint URL:** `https://monthlyalerts.com/api/webhooks/stripe`

## 🔑 Get the Signing Secret

1. **Go to your webhook in Stripe:**
   - https://dashboard.stripe.com/webhooks/we_1SGegQIg8foNZBNgAA1MGXas
   - **Make sure you're in Live Mode**

2. **Reveal the signing secret:**
   - Scroll down to "Signing secret"
   - Click "Reveal"
   - Copy the secret (starts with `whsec_...`)

## 🔧 Add to Vercel

1. **Go to Vercel Environment Variables:**
   - https://vercel.com/your-project/settings/environment-variables

2. **Update or Add:**
   - Variable name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_YOUR_SIGNING_SECRET`
   - Environment: Production (and Preview if you want)

3. **Save**

4. **Redeploy your site** (important!)
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"
   - OR just push any change to trigger deployment

## ✅ Verify Events Are Selected

Make sure these events are enabled on your webhook:

- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`  
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

If not all are selected:
1. Click your webhook
2. Click "..." menu → "Update details"
3. Add missing events
4. Save

## 🧪 Test the Webhook

### Option 1: Test via Stripe Dashboard

1. Go to your webhook page
2. Scroll down to "Send test webhook"
3. Select `customer.subscription.updated`
4. Click "Send test webhook"
5. Should show 200 response ✅

### Option 2: Create Real Subscription

1. Go to https://monthlyalerts.com
2. Subscribe with real card
3. Check webhook logs for events
4. All should show 200 ✅

## 📊 Monitor Webhook

After testing, check:
- https://dashboard.stripe.com/webhooks/we_1SGegQIg8foNZBNgAA1MGXas
- Recent events should show green checkmarks
- If red X, click to see error details

## Common Issues

### 401 Unauthorized
**Cause:** Webhook secret mismatch  
**Fix:** Double-check `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe

### 500 Server Error
**Cause:** Application error  
**Fix:** Check Vercel logs: `vercel logs`

### Timeout
**Cause:** Webhook taking too long  
**Fix:** Check database connection, simplify webhook logic

## ✅ You're Ready!

Once webhook shows 200 responses, you're all set to accept real customers! 🚀


