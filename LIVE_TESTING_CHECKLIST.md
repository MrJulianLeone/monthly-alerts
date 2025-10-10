# Live Stripe Testing Checklist

## ✅ Pre-Test Verification

- [x] Stripe live keys updated in Vercel
- [x] Vercel deployment complete
- [ ] Production site is accessible
- [ ] Live webhook is configured in Stripe
- [ ] Webhook secret is set in Vercel

## 🧪 Test 1: Verify Keys Are Live

### Check Your Production Site

1. **Open Browser Developer Console**
   - Go to: https://monthlyalerts.com
   - Press F12 or right-click → Inspect
   - Go to Console tab

2. **Go to Subscribe Page**
   - Navigate to: Dashboard → Subscribe

3. **Check for Stripe Key**
   - Look in Network tab or Console
   - You should see requests using `pk_live_...` (NOT `pk_test_...`)
   - If you see `pk_test_`, the environment variables didn't update

### Verify in Stripe Dashboard

- Open: https://dashboard.stripe.com
- Make sure toggle is on **Live Mode** (not Test Mode)
- Keep this tab open for monitoring

## 🧪 Test 2: Create Real Subscription

### Step-by-Step Test

1. **Sign Up / Log In**
   - Go to: https://monthlyalerts.com
   - Create a new account or log in

2. **Navigate to Subscribe**
   - Dashboard → Subscribe Now

3. **Enter Payment Information**
   - Use a REAL card (your own)
   - Complete the Stripe checkout
   - Amount: $29.99 + tax

4. **Complete Purchase**
   - Click "Subscribe"
   - Wait for redirect back to dashboard

### ✅ Expected Results

- ✅ Redirected to dashboard with success message
- ✅ Dashboard shows "Active Subscription"
- ✅ Subscription visible in Stripe Dashboard (Live mode)
- ✅ Subscription recorded in your database

## 🧪 Test 3: Verify Database Entry

```bash
# Connect to your database
psql $DATABASE_URL

# Check for the subscription
SELECT 
  stripe_subscription_id,
  stripe_customer_id,
  status,
  cancel_at_period_end,
  current_period_end
FROM subscriptions 
WHERE stripe_subscription_id LIKE 'sub_%'
ORDER BY created_at DESC 
LIMIT 1;
```

### ✅ Expected Results

- ✅ Subscription ID starts with `sub_` (real subscription)
- ✅ Status is `active`
- ✅ `cancel_at_period_end` is `false`
- ✅ `current_period_end` is ~30 days in future

## 🧪 Test 4: Check Stripe Dashboard

1. **Go to Subscriptions**
   - https://dashboard.stripe.com/subscriptions
   - **Ensure you're in Live Mode**

2. **Verify Subscription**
   - Should see your subscription
   - Status: Active
   - Amount: $29.99/month

3. **Check Customer**
   - https://dashboard.stripe.com/customers
   - Should see customer with your email
   - Payment method attached

## 🧪 Test 5: Verify Webhook

### Check Webhook Logs

1. **Go to Webhooks**
   - https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint

2. **View Recent Events**
   - Should see `checkout.session.completed`
   - Should see `customer.subscription.updated`
   - All should have **green checkmarks** (200 response)

3. **If Any Failed (Red X):**
   - Click to see error details
   - Common issues:
     - 401: Webhook secret mismatch
     - 500: Application error
     - Timeout: Webhook took too long

### Check Vercel Logs

```bash
# View real-time logs
vercel logs --follow

# Or check in Vercel dashboard
# https://vercel.com/your-project/logs
```

Look for:
- `[v0] Received Stripe webhook event: checkout.session.completed`
- `[Webhook] Subscription record created`
- No errors

## 🧪 Test 6: Test Cancellation

### Cancel Subscription

1. **Go to Dashboard**
   - https://monthlyalerts.com/dashboard

2. **Manage Subscription**
   - Click "Manage Subscription"
   - Click "Cancel Subscription"
   - Confirm cancellation

### ✅ Expected Results

- ✅ Success message shown
- ✅ Dashboard shows "Subscription cancels at [date]"
- ✅ In Stripe Dashboard: subscription shows "Cancels at [date]"

### Verify in Database

```sql
SELECT 
  stripe_subscription_id,
  status,
  cancel_at_period_end,
  current_period_end
FROM subscriptions 
WHERE stripe_subscription_id LIKE 'sub_%'
ORDER BY created_at DESC 
LIMIT 1;
```

### ✅ Expected Results

- ✅ Status is still `active`
- ✅ `cancel_at_period_end` is now `true`
- ✅ You still have access until `current_period_end`

## 🧪 Test 7: Check Webhook for Cancellation

1. **Go to Webhook Logs**
   - https://dashboard.stripe.com/webhooks
   - Check for `customer.subscription.updated` event
   - Should show `cancel_at_period_end: true`

## 💰 Test 8: Refund Yourself (Optional)

If you want your money back after testing:

1. **Go to Payments**
   - https://dashboard.stripe.com/payments

2. **Find Your Payment**
   - Should be the most recent one
   - Amount: $29.99 + tax

3. **Refund**
   - Click on the payment
   - Click "Refund payment"
   - Select full amount
   - Confirm

**Note:** Refund takes 5-10 business days to appear in your account.

## 🔍 Troubleshooting

### Issue: Still Seeing Test Mode

**Symptoms:**
- Keys start with `pk_test_`
- Subscriptions go to test dashboard

**Fix:**
1. Verify Vercel environment variables are updated
2. Ensure you redeployed after updating variables
3. Clear browser cache and hard refresh (Cmd+Shift+R)

### Issue: Webhook Not Firing

**Symptoms:**
- Subscription created in Stripe
- Not appearing in database
- Webhook logs show errors

**Fix:**
1. Check webhook endpoint URL is correct: `https://monthlyalerts.com/api/webhooks/stripe`
2. Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches webhook secret in Stripe
3. Check Vercel logs for errors
4. Ensure webhook is in Live mode (not test mode)

### Issue: Payment Fails

**Symptoms:**
- Card is declined
- Error during checkout

**Fix:**
1. Ensure using a real card (not test card 4242...)
2. Check card has sufficient funds
3. Verify card isn't blocked by bank
4. Try different card

### Issue: 401 Webhook Error

**Cause:** Webhook secret mismatch

**Fix:**
1. Go to Stripe webhook settings
2. Reveal signing secret
3. Copy it exactly
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel
5. Redeploy

### Issue: Database Not Updating

**Symptoms:**
- Stripe shows subscription
- Database has no record

**Fix:**
1. Check webhook logs in Stripe - any errors?
2. Check Vercel logs for application errors
3. Verify database connection in Vercel (`DATABASE_URL`)
4. Test database query manually

## 📊 Success Criteria

All tests should pass:

- ✅ Production site loads
- ✅ Stripe checkout uses live keys (`pk_live_...`)
- ✅ Can create subscription with real card
- ✅ Payment processes successfully
- ✅ Subscription appears in Stripe Dashboard (Live)
- ✅ Subscription appears in database
- ✅ Webhooks deliver successfully (200 responses)
- ✅ Can cancel subscription
- ✅ Cancellation updates both Stripe and database
- ✅ Dashboard reflects subscription status correctly

## 📝 Quick Test Commands

```bash
# Check production deployment status
vercel ls

# View live logs
vercel logs --follow

# Check database for subscriptions
psql $DATABASE_URL -c "SELECT stripe_subscription_id, status, cancel_at_period_end FROM subscriptions ORDER BY created_at DESC LIMIT 5;"

# Verify environment variables are set
vercel env ls
```

## 🎉 After All Tests Pass

You're ready for real customers! 🚀

Next steps:
1. Monitor first few real subscriptions closely
2. Set up Stripe email receipts
3. Configure Stripe Radar for fraud prevention
4. Consider setting up Stripe billing portal
5. Monitor webhook logs regularly

## 📞 Support

If tests fail:
- Check Vercel logs: `vercel logs`
- Check Stripe logs: https://dashboard.stripe.com/logs
- Review webhook deliveries: https://dashboard.stripe.com/webhooks
- Contact Stripe support if needed

## Important Notes

- **Real money**: You're using real payment processing
- **Stripe fees**: 2.9% + $0.30 per transaction
- **Refunds**: Take 5-10 business days
- **Webhooks**: Critical for subscription management
- **Testing**: Always verify in both Stripe Dashboard and your database

---

**Good luck with your launch!** 🚀

