# Email Subject Lines - Summary

All email subject lines have been updated to remove "MonthlyAlerts.com" branding. Here's a complete list of all email templates and their subject lines:

## User-Facing Emails

### 1. Email Verification
- **File**: `app/actions/email-verification.ts`
- **Subject**: `Verify Your Email Address`
- **When Sent**: After user signs up
- **Purpose**: Verify email ownership

### 2. Password Reset
- **File**: `app/actions/password-reset.ts`
- **Subject**: `Reset Your Password`
- **When Sent**: User requests password reset
- **Purpose**: Provide password reset link

### 3. Welcome Email
- **File**: `app/actions/send-welcome-email.ts`
- **Subject**: `Welcome!`
- **When Sent**: After email verification
- **Purpose**: Welcome new verified users

### 4. Account Setup Email
- **File**: `app/actions/send-account-setup-email.ts`
- **Subject**: `Complete Your Account Setup`
- **When Sent**: Admin manually adds user to subscriber list
- **Purpose**: Allow new admin-added users to set password and complete profile

### 5. Subscription Confirmation
- **File**: `app/actions/send-subscription-email.ts`
- **Subject**: `Thank You for Subscribing!`
- **When Sent**: User successfully subscribes via Stripe
- **Purpose**: Confirm active subscription

### 6. Monthly Research Alerts
- **File**: `app/actions/alerts.tsx` (uses subject from `generate-alert.ts`)
- **Subject Format**: `{Company Name} ({Ticker}) - {Sentiment}`
  - Example: `Apple Inc. (AAPL) - Positive`
  - Example: `Tesla Inc. (TSLA) - Negative`
- **When Sent**: Admin sends monthly research alert
- **Purpose**: Deliver investment research to subscribers

### 7. Custom Messages
- **File**: `app/actions/messages.tsx`
- **Subject**: Custom (admin-defined)
- **When Sent**: Admin sends custom message to subscribers
- **Purpose**: Communicate with subscribers outside of regular alerts

## Admin-Only Emails

### 8. New Subscription Notification
- **File**: `app/actions/send-admin-notification.ts`
- **Subject**: `🎉 New Subscription`
- **When Sent**: New user subscribes
- **Purpose**: Notify admins of new subscribers

## Subject Line Format Guidelines

### For Alerts:
- **Format**: `{Company Name} ({Ticker}) - {Sentiment}`
- Sentiment is either "Positive" or "Negative"
- No additional branding or prefixes
- Clean and professional

### For System Emails:
- Short and descriptive
- No company name in subject
- Action-oriented when appropriate
- Professional tone

## Changes Made

All email subjects previously included "MonthlyAlerts.com" which has been removed:

| Before | After |
|--------|-------|
| Verify Your Email Address - MonthlyAlerts.com | Verify Your Email Address |
| Reset Your Password - MonthlyAlerts.com | Reset Your Password |
| Welcome to MonthlyAlerts.com! | Welcome! |
| Complete Your MonthlyAlerts.com Account Setup | Complete Your Account Setup |
| Thank You for Subscribing to MonthlyAlerts.com! | Thank You for Subscribing! |
| 🎉 New Subscription - MonthlyAlerts.com | 🎉 New Subscription |
| {Company} ({Ticker}) - Positive Alert | {Company} ({Ticker}) - Positive |
| {Company} ({Ticker}) - Negative Alert | {Company} ({Ticker}) - Negative |

## Notes

- The "from" name remains "MonthlyAlerts.com" for brand recognition in email clients
- Email footer still references MonthlyAlerts.com for unsubscribe links and disclaimers
- Only subject lines were simplified per user request

