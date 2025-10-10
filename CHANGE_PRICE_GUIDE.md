# How to Change Subscription Price

## Current Price: $29.99/month

The subscription price is hardcoded in multiple places in your application.

## 📝 Files to Update

### 1. **Backend - Actual Charge Amount**
**File:** `app/actions/subscription.ts`  
**Line:** 43

```typescript
unit_amount: 2999, // $29.99
```

Change `2999` to your new price in cents:
- $19.99 = `1999`
- $39.99 = `3999`
- $49.99 = `4999`

### 2. **Home Page - Hero Section**
**File:** `app/page.tsx`  
**Line:** 63

```typescript
First alert free for all registered users • Then $29.99/month + tax
```

### 3. **Home Page - Pricing Section**
**File:** `app/page.tsx`  
**Line:** 155

```typescript
<span className="text-5xl font-bold">$29.99</span>
```

### 4. **Subscribe Page**
**File:** `app/dashboard/subscribe/page.tsx`  
**Line:** 40

```typescript
<p className="text-3xl font-bold text-primary mb-6">$29.99<span className="text-lg font-normal">/month + tax</span></p>
```

### 5. **Dashboard Buttons**
**File:** `app/dashboard/page.tsx`  
**Lines:** 156, 169

```typescript
Resubscribe - $29.99/month + tax
Subscribe Now - $29.99/month + tax
```

### 6. **Admin Revenue Calculation**
**File:** `app/admin/subscriptions/page.tsx`  
**Line:** 54

```typescript
const monthlyRevenue = (total * 29.99).toFixed(2)
```

## 🚀 Quick Change Script

Here's a script to change the price everywhere at once:

```bash
#!/bin/bash
# Change price from $29.99 to your new price

OLD_PRICE="29.99"
NEW_PRICE="39.99"  # Change this to your desired price

OLD_CENTS="2999"
NEW_CENTS="3999"   # Price in cents (no decimal)

# Update subscription.ts (the actual charge)
sed -i.bak "s/unit_amount: $OLD_CENTS,/unit_amount: $NEW_CENTS,/" app/actions/subscription.ts

# Update all display prices
find app -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/\$$OLD_PRICE/\$$NEW_PRICE/g" {} \;

# Update admin revenue calculation
sed -i.bak "s/total \* $OLD_PRICE/total * $NEW_PRICE/" app/admin/subscriptions/page.tsx

echo "✓ Price updated from \$$OLD_PRICE to \$$NEW_PRICE"
echo "✓ Please review changes and test before deploying"
```

## ⚠️ Important Notes

1. **Existing Subscriptions**: Price change only affects NEW subscriptions
2. **Old Customers**: Keep paying the old price (Stripe doesn't auto-update)
3. **Test First**: Change price in test mode first, then deploy to production
4. **Stripe Products**: Consider using Stripe Products/Prices for easier management

## 💡 Better Approach: Use Stripe Products

Instead of hardcoding, you can create products in Stripe:

### Create Product in Stripe:
1. Go to: https://dashboard.stripe.com/products
2. Click "Add product"
3. Name: "MonthlyAlerts Subscription"
4. Price: $29.99/month (or your price)
5. Copy the Price ID (e.g., `price_abc123...`)

### Use in Code:
```typescript
// Instead of price_data, use the price ID:
line_items: [
  {
    price: 'price_abc123...', // Your price ID from Stripe
    quantity: 1,
  },
]
```

**Benefits:**
- Change price in Stripe Dashboard (no code changes)
- Manage multiple pricing tiers
- Easier to track in Stripe

## 🧪 Testing Price Changes

After changing price:

1. **Test locally:**
   ```bash
   npm run dev
   ```
   
2. **Check all pages:**
   - Home page pricing section
   - Subscribe page
   - Dashboard buttons

3. **Create test subscription:**
   - Use test Stripe keys
   - Verify correct amount is charged

4. **Deploy to production:**
   ```bash
   git add .
   git commit -m "Update subscription price to $XX.XX"
   git push origin main
   ```

## 📊 Current Price Locations

- ✅ Backend charge: `app/actions/subscription.ts`
- ✅ Home hero: `app/page.tsx` (line 63)
- ✅ Home pricing: `app/page.tsx` (line 155)
- ✅ Subscribe page: `app/dashboard/subscribe/page.tsx`
- ✅ Dashboard buttons: `app/dashboard/page.tsx`
- ✅ Admin calculations: `app/admin/subscriptions/page.tsx`

## 🔄 Migrating Existing Customers to New Price

If you want to change price for existing customers:

1. In Stripe Dashboard, go to the subscription
2. Click "Update subscription"
3. Change the price
4. Choose when to apply:
   - Immediately
   - At next renewal
   - On a specific date

---

**Need help changing the price? Let me know what you want to change it to and I can help!**


