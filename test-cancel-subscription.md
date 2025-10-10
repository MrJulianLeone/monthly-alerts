# Testing Subscription Cancellation

## Current Implementation

Your cancellation flow:
1. ✅ User clicks "Cancel" → calls `cancelSubscription()`
2. ✅ Calls `stripe.subscriptions.update(id, { cancel_at_period_end: true })`
3. ✅ Updates database: `cancel_at_period_end = true`
4. ✅ Webhook receives `customer.subscription.updated` (immediately)
5. ✅ Webhook receives `customer.subscription.deleted` (when period ends)
6. ✅ Database sets `status = 'cancelled'`

## Quick Test Checklist

### ✅ Test 1: Cancel Button Works
- [ ] Login to dashboard
- [ ] Go to Manage Subscription
- [ ] Click "Cancel Subscription"
- [ ] Verify success message appears
- [ ] Verify redirected to dashboard

### ✅ Test 2: Stripe Updated
- [ ] Open [Stripe Test Dashboard](https://dashboard.stripe.com/test/subscriptions)
- [ ] Find the subscription
- [ ] Verify it shows "Cancels at [end date]"
- [ ] Verify `cancel_at_period_end = true` in API response

### ✅ Test 3: Database Updated
```sql
-- Check cancel_at_period_end flag is set
SELECT 
  stripe_subscription_id,
  status,
  cancel_at_period_end,
  current_period_end,
  updated_at
FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID'::uuid;
```

### ✅ Test 4: Webhook Receives Event
```bash
# Terminal 1: Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Trigger cancellation event
stripe trigger customer.subscription.deleted
```

### ✅ Test 5: Final Status After Period
- Option A: Wait until period ends (not practical)
- Option B: Use Stripe CLI to trigger event (recommended)

```bash
# Simulate the subscription actually being deleted
stripe subscriptions cancel sub_XXXXX --test

# Or trigger the webhook event directly
stripe trigger customer.subscription.deleted
```

## Stripe Test Cards

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Always fails |

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

## Command Reference

### Create Test Subscription via Stripe CLI
```bash
# Create customer
stripe customers create \
  --email test@example.com \
  --test

# Create subscription
stripe subscriptions create \
  --customer cus_XXXXX \
  --items '[{"price": "price_XXXXX"}]' \
  --test
```

### Cancel Test Subscription
```bash
# Cancel at period end (what your app does)
stripe subscriptions update sub_XXXXX \
  --cancel-at-period-end=true \
  --test

# Cancel immediately (for testing final state)
stripe subscriptions cancel sub_XXXXX \
  --test
```

### View Subscription Status
```bash
# Get subscription details
stripe subscriptions retrieve sub_XXXXX --test
```

### Test Webhooks Locally
```bash
# Terminal 1: Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 2: Trigger specific events
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Debugging Tips

### Check Logs
Your code logs to console:
- `[Subscription]` - subscription actions
- `[CancelSubscription]` - cancellation flow
- `[Webhook]` - webhook events
- `[v0]` - webhook processing

### Verify Webhook Endpoint
```bash
# Test webhook endpoint is accessible
curl -X POST http://localhost:3000/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "ping"}'
```

### Common Issues

**Issue:** Webhook not receiving events
**Fix:** Make sure webhook secret is set and Stripe CLI is forwarding

**Issue:** Database not updating
**Fix:** Check webhook logs for errors, verify subscription ID matches

**Issue:** Subscription still shows "active"
**Fix:** This is correct! It remains active until period end. Check `cancel_at_period_end` flag

## Production Testing

⚠️ **Important:** When testing in production:
1. Use a real payment method OR
2. Create a 100% discount coupon in Stripe
3. Apply coupon so you're not charged

```bash
# Create 100% off coupon
stripe coupons create \
  --percent-off 100 \
  --duration once \
  --name "Testing Coupon"
```

## Verification Script

Here's a quick verification script:

```bash
#!/bin/bash
# Save as verify-cancellation.sh

echo "🔍 Checking subscription cancellation..."

# Check database
psql $DATABASE_URL -c "
  SELECT 
    u.email,
    s.stripe_subscription_id,
    s.status,
    s.cancel_at_period_end,
    s.current_period_end
  FROM subscriptions s
  JOIN users u ON s.user_id = u.id
  WHERE s.stripe_subscription_id LIKE 'sub_%'
  ORDER BY s.updated_at DESC
  LIMIT 5;
" 

echo ""
echo "✅ If cancel_at_period_end = true, cancellation is working!"
echo "✅ After period_end passes, status should become 'cancelled'"
```

## Expected Behavior

### Immediately After Cancellation
- ✅ Stripe: `cancel_at_period_end = true`, status = `active`
- ✅ Database: `cancel_at_period_end = true`, status = `active`
- ✅ User still has access until period ends

### After Period Ends
- ✅ Stripe: status = `canceled` (past tense)
- ✅ Database: status = `cancelled` (via webhook)
- ✅ User loses access
- ✅ No future billing

## Resources
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

