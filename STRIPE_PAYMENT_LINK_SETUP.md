# Stripe Payment Link Configuration Guide

## What Information to Collect

### Currently Collected (Default)
- ✅ **Email address** - Required for account matching
- ✅ **Payment method** - Credit/debit card
- ✅ **Billing address** - For tax calculation

### Recommended to Add

#### 1. **Phone Number** (Optional but Recommended)
**Why:** Helpful for customer support, fraud prevention
**How to add:**
1. Go to your payment link settings
2. Find "Customer information"
3. Toggle "Collect phone number"

#### 2. **Promotional Code Field** (Optional)
**Why:** Allows you to offer discounts/coupons
**How to add:**
1. In payment link settings
2. Find "Promotional codes"
3. Enable it

#### 3. **Tax ID Collection** (For B2B)
**Why:** If selling to businesses, collect VAT/Tax ID
**How to add:**
1. In payment link settings
2. Find "Tax ID collection"
3. Enable for specific countries

### What NOT to Collect

❌ **Name** - Stripe already collects billing name automatically
❌ **Additional addresses** - Not needed for digital subscriptions
❌ **Custom fields** - Keep checkout simple

## Recommended Minimal Setup

For a digital subscription service like yours:

1. ✅ Email (required - already collected)
2. ✅ Payment method (required - already collected)
3. ✅ Billing address (required for tax - already collected)
4. ⚡ Phone number (optional - good to have)

**Keep it simple!** The fewer fields, the higher conversion rate.

## Configure Your Payment Link

### Step 1: Access Your Payment Link

1. Go to: https://dashboard.stripe.com/payment-links
2. Find your link (should see it listed)
3. Click the "..." menu → **Edit**

### Step 2: Configure Settings

#### **After Payment Section**

This is where you set what happens after payment:

**Option A: Redirect to your website (Recommended)**
- Choose: "Show a custom page"
- Enter URL: `https://monthlyalerts.com/dashboard?success=true`
- This brings users back to your site

**Option B: Show Stripe confirmation page**
- Default option
- Users stay on Stripe's page
- Shows success message

**Important:** There's NO "cancel URL" option for payment links. If users close the page, they just go back to your site manually.

#### **Customer Information**

Set what to collect:
- [x] Email (required)
- [ ] Phone number (optional - recommended)
- [ ] Shipping address (not needed for digital)

#### **Promotional Codes**

Enable if you want to offer discounts:
- [ ] Allow promotion codes
- Create promo codes in Stripe Dashboard

#### **Tax Collection**

Should already be enabled:
- [x] Collect tax automatically (Stripe Tax)
- This calculates tax based on customer location

### Step 3: Save Changes

Click "Save" to update your payment link.

---

## Payment Link vs Checkout Session

**Payment Link** (what you're using):
- ✅ Simpler to set up
- ✅ Managed in Stripe Dashboard
- ❌ No "cancel URL" option
- ❌ Less customization

**Checkout Session** (alternative):
- ✅ More control in code
- ✅ Has success AND cancel URLs
- ✅ More customization
- ❌ Requires more code

### If You Want Cancel URL Support

You'd need to switch to dynamic checkout sessions:

```typescript
// app/actions/subscription.ts already has this code!
const session = await stripe.checkout.sessions.create({
  success_url: `${baseUrl}/dashboard?success=true`,
  cancel_url: `${baseUrl}/dashboard?canceled=true`, // ← Only available here
  // ... other options
})
```

But for most use cases, payment links work great without it!

---

## Current Configuration Checklist

Check your payment link has these settings:

### Basic Settings
- [ ] Name: "MonthlyAlerts Subscription"
- [ ] Price: $29.99/month
- [ ] Recurring: Monthly
- [ ] Currency: USD

### After Payment
- [ ] Redirect to: `https://monthlyalerts.com/dashboard?success=true`
- Or: Show Stripe confirmation page

### Customer Information
- [x] Email (always required)
- [ ] Phone (optional - your choice)
- [ ] Billing address (for tax)

### Features
- [x] Tax collection enabled (automatic)
- [ ] Promotional codes (optional)
- [ ] Allow adjustable quantities: OFF

### Advanced
- [ ] Require customer confirmation: ON (prevents duplicate payments)
- [ ] Allow free trial: OFF (unless you want one)

---

## Viewing Payment Link Settings

1. **Go to:** https://dashboard.stripe.com/payment-links
2. **Find your payment link** in the list
3. **Click it** to see current settings
4. **Click "..." menu** → "Edit" to change settings

**Your payment link URL:**
```
https://buy.stripe.com/dRm8wPcKi5Zyfdi7xS73G00
```

You can test it by clicking it yourself (just don't complete payment!)

---

## Quick Reference: What to Collect

| Information | Status | Why |
|-------------|--------|-----|
| Email | ✅ Required | Account matching |
| Payment method | ✅ Required | Process payment |
| Billing address | ✅ Required | Tax calculation |
| Phone number | ⚡ Optional | Customer support |
| Name | ✅ Auto-collected | Billing |
| Promotional code | ⚡ Optional | Discounts |
| Tax ID | ❌ Not needed | Only for B2B |
| Shipping | ❌ Not needed | Digital product |

---

## About Cancel URL

**Important:** Stripe Payment Links do NOT have a "cancel URL" option.

**What happens if user cancels?**
- They close the browser tab
- Or click back button (goes to previous page)
- No redirect happens

**Alternatives:**
1. **Accept it** - Most users just close the tab
2. **Switch to checkout sessions** - Gives you cancel_url control
3. **Use browser back** - User naturally returns to your site

For most businesses, this isn't an issue. Payment abandonment is normal and expected.

---

## Recommended Setup

For MonthlyAlerts.com:

```
Customer Information:
- Email: Required ✅
- Phone: Optional ✅ (recommended)
- Billing address: Required ✅

After Payment:
- Redirect to: https://monthlyalerts.com/dashboard?success=true ✅

Features:
- Tax collection: Automatic ✅
- Promotional codes: Optional (your choice)
- Trial period: None

Price:
- $29.99/month + tax ✅
```

**This keeps checkout simple while collecting what you need!**

---

## Testing Your Payment Link

1. **Click your payment link:** `https://buy.stripe.com/dRm8wPcKi5Zyfdi7xS73G00`
2. **Fill out the form** (use test card if in test mode)
3. **Check what information is collected**
4. **Verify redirect after payment**
5. **Check webhook fires correctly**

**Test card for live mode (won't charge):**
- Use your own real card
- Complete the flow
- Immediately refund in Stripe Dashboard

---

## Next Steps

1. Review your payment link settings
2. Add phone number collection (recommended)
3. Set up redirect URL to your dashboard
4. Test the complete flow
5. Monitor first few real subscriptions

**Questions about what to collect?** Keep it minimal - every extra field reduces conversion!

