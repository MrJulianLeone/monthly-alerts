# Quick Start: Testing Subscription Cancellation

## 🚀 Run the Test (3 Steps)

### 1. Start Your Dev Server
```bash
npm run dev
```
Keep this running in one terminal.

### 2. Run the Test (in a new terminal)
```bash
npm run test:subscription
```

### 3. Review Results
You'll see a detailed report showing all test steps and results.

## What Happens During the Test

The automated test will:

1. ✅ Create a test user (`test-cancel-[timestamp]@example.com`)
2. ✅ Create a Stripe customer (test mode)
3. ✅ Create a subscription ($29.99/month)
4. ✅ Add subscription to your database
5. ✅ Cancel the subscription (set `cancel_at_period_end`)
6. ✅ Verify Stripe shows "Cancels at [date]"
7. ✅ Verify database updated correctly
8. ✅ Simulate period end (immediate cancel)
9. ✅ Verify final state is `cancelled` everywhere

**All in test mode - no real charges!**

## Expected Output

```
╔════════════════════════════════════════════════╗
║  Subscription Cancellation Flow Test Suite    ║
╚════════════════════════════════════════════════╝

Checking prerequisites...
✓ Stripe test mode configured
✓ Database connection successful

═══════════════════════════════════════════════
STEP 1: Creating Test User
═══════════════════════════════════════════════
✓ User Creation

═══════════════════════════════════════════════
STEP 2: Creating Stripe Customer
═══════════════════════════════════════════════
✓ Stripe Customer Creation

═══════════════════════════════════════════════
STEP 3: Creating Subscription
═══════════════════════════════════════════════
✓ Stripe Subscription Creation
✓ Database Subscription Record

═══════════════════════════════════════════════
STEP 4: Cancelling Subscription
═══════════════════════════════════════════════
✓ Stripe Cancel at Period End
✓ Database Cancel Flag Updated

═══════════════════════════════════════════════
STEP 5: Simulating Period End
═══════════════════════════════════════════════
✓ Stripe Final Cancellation
✓ Database Final Status

═══════════════════════════════════════════════
Test Results Summary
═══════════════════════════════════════════════
✓ User Creation
✓ Stripe Customer Creation
✓ Stripe Subscription Creation
✓ Stripe Cancel at Period End
✓ Database Cancel Flag Updated
✓ Stripe Final Cancellation
✓ Database Final Status
✓ Complete Flow Verification

🎉 ALL TESTS PASSED! (8/8)
Subscription cancellation flow is working correctly!

Do you want to clean up test data? (y/N)
```

## Cleanup

After the test, you'll be asked to clean up:
- **Y** = Removes test data from Stripe and database
- **N** = Keeps data for manual inspection

## Troubleshooting

### "Server is not running"
→ Start dev server: `npm run dev`

### "Database connection failed"
→ Check `.env.local` has `DATABASE_URL`

### "Stripe test mode not configured"
→ Check `.env.local` has `STRIPE_SECRET_KEY` starting with `sk_test_`

## Manual Testing Alternative

If you prefer to test manually:

1. **Start server**: `npm run dev`
2. **Go to**: http://localhost:3000
3. **Sign up** with a test email
4. **Subscribe** using test card: `4242 4242 4242 4242`
5. **Cancel** from Dashboard → Manage Subscription
6. **Verify** in [Stripe Dashboard](https://dashboard.stripe.com/test/subscriptions)

## Files Created

- `test-subscription-flow.js` - Main test script (Node.js)
- `test-subscription-flow.sh` - Alternative bash version
- `TEST_SUBSCRIPTION.md` - Detailed documentation
- `test-cancel-subscription.md` - Manual testing guide

## Next Steps

Once all tests pass ✅:
- Your cancellation flow is verified working
- Safe to deploy to production
- Stripe webhooks will handle real cancellations
- Users can cancel and won't be charged after period ends

## Questions?

See `TEST_SUBSCRIPTION.md` for detailed documentation.

