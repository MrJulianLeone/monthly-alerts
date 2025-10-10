# Subscription Cancellation Testing

This directory contains automated test scripts to verify the complete subscription cancellation flow.

## What Gets Tested

The test scripts verify the entire subscription lifecycle:

1. ✅ **User Creation** - Creates a test user in the database
2. ✅ **Stripe Customer Creation** - Creates a Stripe customer
3. ✅ **Subscription Creation** - Creates a subscription via Stripe API
4. ✅ **Database Sync** - Verifies subscription is saved to database
5. ✅ **Cancel at Period End** - Sets `cancel_at_period_end = true`
6. ✅ **Stripe Cancellation** - Verifies Stripe updates correctly
7. ✅ **Database Updates** - Verifies database reflects cancellation
8. ✅ **Final State** - Simulates period end and verifies final cancelled state

## Prerequisites

Before running tests, ensure:

- ✅ Development server is running (`npm run dev`)
- ✅ Stripe test keys are configured in `.env.local`
- ✅ Database connection is working
- ✅ Stripe CLI is installed (for bash version)

### Install Stripe CLI (Optional)

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

## Running Tests

### Option 1: Node.js Test (Recommended)

```bash
npm run test:subscription
```

Or directly:
```bash
node test-subscription-flow.js
```

**Advantages:**
- No external dependencies
- Cross-platform
- Easy to debug
- Detailed output

### Option 2: Bash Test

```bash
npm run test:subscription:bash
```

Or directly:
```bash
./test-subscription-flow.sh
```

**Advantages:**
- Standalone script
- Works with any environment
- Can be run in CI/CD

## Test Output

You'll see colorized output showing:

```
╔════════════════════════════════════════════════╗
║  Subscription Cancellation Flow Test Suite    ║
╚════════════════════════════════════════════════╝

Checking prerequisites...
✓ Server is running at http://localhost:3000
✓ Stripe test mode configured
✓ Database connection successful

═══════════════════════════════════════════════
STEP 1: Creating Test User
═══════════════════════════════════════════════
✓ Test user created
  User ID: abc-123-def-456

═══════════════════════════════════════════════
STEP 2: Creating Stripe Customer
═══════════════════════════════════════════════
✓ Stripe customer created
  Customer ID: cus_xxx

═══════════════════════════════════════════════
STEP 3: Creating Subscription
═══════════════════════════════════════════════
✓ Stripe subscription created
  Subscription ID: sub_xxx

═══════════════════════════════════════════════
STEP 4: Cancelling Subscription
═══════════════════════════════════════════════
✓ Stripe subscription set to cancel at period end
✓ Database updated with cancellation flag

═══════════════════════════════════════════════
STEP 5: Simulating Period End
═══════════════════════════════════════════════
✓ Stripe subscription cancelled
✓ Database updated to cancelled status

═══════════════════════════════════════════════
STEP 6: Final Verification
═══════════════════════════════════════════════
Database Final State: cancelled | t
Stripe Final Status: canceled

═══════════════════════════════════════════════
Test Results Summary
═══════════════════════════════════════════════
✓ Test 1: User creation
✓ Test 2: Stripe customer creation
✓ Test 3: Subscription creation
✓ Test 4: Cancel at period end flag
✓ Test 5: Stripe final cancellation
✓ Test 6: Database final status

🎉 ALL TESTS PASSED! (6/6)
Subscription cancellation flow is working correctly!
```

## Cleanup

After tests complete, you'll be prompted:

```
Do you want to clean up test data? (y/N)
```

- **Yes (y)**: Removes test user, customer, and subscription from both Stripe and database
- **No (N)**: Keeps data for manual inspection

## What the Tests Verify

### 1. Cancel at Period End Flow
- User clicks "Cancel Subscription" button
- App calls `stripe.subscriptions.update(id, { cancel_at_period_end: true })`
- Database updates `cancel_at_period_end = true`
- Subscription remains `active` until period ends
- User retains access until period end

### 2. Final Cancellation
- When period ends, Stripe sends `customer.subscription.deleted` webhook
- Webhook handler updates database `status = 'cancelled'`
- User loses access
- No future billing occurs

### 3. Database Consistency
- Stripe and database states match at all times
- Cancellation flags are properly synchronized
- Status updates are recorded correctly

## Debugging Failed Tests

### Test Fails at User Creation
**Cause:** Database connection issue
**Fix:** Check `DATABASE_URL` in `.env.local`

### Test Fails at Stripe Customer/Subscription
**Cause:** Stripe API key issue
**Fix:** 
- Verify `STRIPE_SECRET_KEY` in `.env.local`
- Ensure using test key (`sk_test_...`)
- Check Stripe dashboard for API errors

### Test Fails at Database Update
**Cause:** SQL syntax or schema mismatch
**Fix:**
- Run migrations: `./run-migrations.sh`
- Check subscriptions table schema
- Verify UUID format compatibility

### Cancel at Period End Not Set
**Cause:** Stripe API call failed
**Fix:**
- Check Stripe API logs
- Verify subscription ID exists
- Ensure test mode is enabled

## Manual Verification

If you want to manually verify the cancellation in Stripe:

1. Go to [Stripe Test Dashboard](https://dashboard.stripe.com/test/subscriptions)
2. Find your test subscription
3. Look for "Cancels at [date]" indicator
4. Check subscription details:
   ```json
   {
     "cancel_at_period_end": true,
     "status": "active"
   }
   ```

## Testing in Production

⚠️ **Important:** When testing with real subscriptions:

### Option A: Use 100% Discount Coupon

```bash
# Create coupon in Stripe
stripe coupons create \
  --percent-off 100 \
  --duration once \
  --name "Testing Coupon" \
  --live

# Apply during checkout
```

### Option B: Cancel Immediately After Subscribe

1. Subscribe with real payment method
2. Immediately cancel (you won't be charged)
3. Verify cancellation worked

## Integration with CI/CD

To run tests in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Subscription Tests
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
  run: |
    npm run test:subscription
```

## Test Data

Test scripts create:
- Email: `test-cancel-[timestamp]@example.com`
- Password: `TestPass123`
- Name: `Test User`
- All in test mode (no real charges)

## Expected Behavior Checklist

After running tests, you should see:

- [ ] User created in database
- [ ] Stripe customer created
- [ ] Stripe subscription created with `status = "active"`
- [ ] Database subscription record matches Stripe
- [ ] `cancel_at_period_end = true` in both Stripe and database
- [ ] Subscription still shows `status = "active"`
- [ ] After period end simulation, `status = "canceled"` in Stripe
- [ ] Database updated to `status = "cancelled"`
- [ ] All 6 tests pass

## Troubleshooting

### "Server is not running"
```bash
# Start dev server
npm run dev
```

### "Stripe CLI not installed" (bash version only)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Or use Node.js version
npm run test:subscription
```

### "Database connection failed"
```bash
# Check environment variable
echo $DATABASE_URL

# Or check .env.local
cat .env.local | grep DATABASE_URL
```

### "Not using Stripe test mode"
```bash
# Verify test key
cat .env.local | grep STRIPE_SECRET_KEY

# Should start with: sk_test_
```

## Related Files

- `test-subscription-flow.js` - Node.js test script (recommended)
- `test-subscription-flow.sh` - Bash test script
- `test-cancel-subscription.md` - Manual testing guide
- `app/actions/subscription.ts` - Cancellation implementation
- `app/api/webhooks/stripe/route.ts` - Webhook handler

## Support

If tests fail consistently:
1. Check the console logs for detailed error messages
2. Verify all prerequisites are met
3. Try manual testing with Stripe dashboard
4. Check webhook logs in Stripe dashboard
5. Review database schema matches expected structure

## Next Steps After Successful Tests

✅ Tests passing means:
- Your cancellation flow works correctly
- Stripe integration is properly configured
- Database updates are functioning
- Webhooks will handle real cancellations

You can now safely:
- Deploy to production
- Test with real users (or test mode customers)
- Monitor cancellations in Stripe dashboard
- Trust your cancellation flow is working

