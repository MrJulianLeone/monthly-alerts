# Payment Link Workflow

## Current Setup

You're using a **Stripe Payment Link** for subscriptions instead of dynamic checkout.

## How It Works

### Subscription Creation

1. **User clicks "Subscribe"** on your site
2. **Redirected to Stripe Payment Link:**
   ```
   https://buy.stripe.com/dRm8wPcKi5Zyfdi7xS73G00
   ```
3. **User completes payment** on Stripe's hosted page
4. **Stripe sends webhook:** `checkout.session.completed`
5. **Your app receives webhook** and stores subscription in database
6. **User redirected back** to your site (success URL)

### Cancellation Process

1. **User goes to** Dashboard → Manage Subscription
2. **App fetches subscription** from database
3. **User clicks "Cancel Subscription"**
4. **App calls Stripe API:**
   ```typescript
   stripe.subscriptions.update(subscriptionId, {
     cancel_at_period_end: true
   })
   ```
5. **Stripe sends webhook:** `customer.subscription.updated`
6. **Database updated** with cancellation flag
7. **User sees confirmation** - access until period end

## ✅ Works Exactly the Same

The cancellation code doesn't care how the subscription was created. It only needs:
- The `subscriptionId` (stored in database)
- Access to Stripe API (to update the subscription)

## Webhook Events to Monitor

### On Subscription Creation (Payment Link)
- ✅ `checkout.session.completed` - Creates database record
- ✅ `customer.subscription.created` - Confirms creation
- ✅ `invoice.payment_succeeded` - First payment

### On Cancellation
- ✅ `customer.subscription.updated` - Updates cancel flag
- ✅ `customer.subscription.deleted` - Final cancellation (when period ends)

## Important: Success/Cancel URLs

**Make sure your Payment Link has these URLs configured:**

In Stripe Dashboard → Payment Links → Your Link:

1. **Success URL:** 
   ```
   https://monthlyalerts.com/dashboard?success=true
   ```

2. **Cancel URL:**
   ```
   https://monthlyalerts.com/dashboard?canceled=true
   ```

To set these:
1. Go to: https://dashboard.stripe.com/payment-links
2. Find your payment link
3. Click "..." → "Edit"
4. Scroll to "After payment"
5. Set custom success/cancel URLs

## Testing Checklist

### Test Subscription Creation
- [ ] User can click "Subscribe"
- [ ] Redirected to Stripe Payment Link
- [ ] Can complete payment
- [ ] Redirected back to dashboard
- [ ] Dashboard shows "Active Subscription"
- [ ] Subscription appears in database
- [ ] Webhook events show 200 OK

### Test Cancellation
- [ ] User can go to "Manage Subscription"
- [ ] Can see subscription details
- [ ] Can click "Cancel Subscription"
- [ ] See confirmation message
- [ ] Dashboard shows "Cancels at [date]"
- [ ] Stripe Dashboard shows cancellation scheduled
- [ ] Database shows `cancel_at_period_end = true`

### Test Webhook Events
- [ ] `checkout.session.completed` fires and creates subscription
- [ ] `customer.subscription.updated` fires on cancellation
- [ ] All events return 200 OK
- [ ] Database updates correctly

## Advantages of Payment Links

✅ **Pros:**
- Easier to set up
- No code for checkout flow
- Stripe handles all payment UI
- Easy to update price in Stripe Dashboard
- Built-in tax calculation
- Mobile-optimized checkout

❌ **Cons:**
- Less customization
- Can't dynamically change price in code
- Limited to Stripe's checkout page design
- Harder to do complex flows

## Alternative: Switch to Dynamic Checkout

If you want more control, you can use the dynamic checkout code that's already in your app:

```typescript
// app/actions/subscription.ts already has this!
export async function createCheckoutSession(userId, userEmail) {
  // Creates custom Stripe checkout session
  // More flexibility, same cancellation flow
}
```

To switch back:
1. Update subscribe page to use the action instead of payment link
2. Handle the redirect to Stripe checkout
3. Everything else stays the same!

## Current Status

✅ **Payment Link is configured correctly**  
✅ **Cancellation workflow works the same**  
✅ **Webhooks handle both creation and cancellation**  
✅ **No changes needed to cancellation code**

## Summary

**The cancellation workflow is IDENTICAL whether you use:**
- Payment Links (current)
- Dynamic checkout (alternative)
- Any other Stripe subscription method

**The app only needs:**
1. Subscription ID (from database)
2. Stripe API access (to update subscription)
3. Webhooks (to sync changes)

All of these work the same regardless of creation method! ✅

