# Fix Signup Error - Instructions

## Problem Identified

The signup was failing because the `users` table was missing `first_name` and `last_name` columns. The code was trying to insert data into columns that didn't exist in the database.

## Solution

I've created a migration to add these missing columns and improved error handling to provide better feedback.

## How to Fix

### Option 1: Run Migration via API (Easiest)

1. Once the code is deployed to Vercel, visit this URL in your browser:
   ```
   https://monthlyalerts.com/api/migrate-names
   ```

2. You should see a success message like:
   ```json
   {
     "success": true,
     "message": "Migration completed successfully. Users table now has first_name and last_name columns."
   }
   ```

3. After this, signup will work correctly!

### Option 2: Run Migration via Command Line

If you prefer to run the migration from your terminal:

```bash
# Get your DATABASE_URL from Vercel
# Visit: https://vercel.com/julian-leones-projects/monthly-alerts/settings/environment-variables

# Then run:
node migrate-add-name-columns.mjs
```

## Changes Made

### 1. Improved Error Handling (`app/actions/auth.ts`)
- Added more detailed error logging with full error details
- Made email verification non-blocking (signup succeeds even if email fails)
- Provided more specific error messages based on error type
- Error message now includes the actual error for debugging

### 2. Database Migration
- Created `scripts/011_add_user_name_columns.sql`
- Created `migrate-add-name-columns.mjs` for Node.js execution
- Created `/api/migrate-names` endpoint for web-based migration

### 3. What the Migration Does
- Adds `first_name` column to `users` table
- Adds `last_name` column to `users` table  
- Updates existing users by splitting their `name` field into first and last names

## Testing Signup

After running the migration, test signup by:

1. Go to https://monthlyalerts.com/signup
2. Fill in the form with:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: TestPass123 (must have uppercase, lowercase, and number)
3. Click "Create Account"

You should now be redirected to the dashboard successfully!

## Error Messages Now Shown

Instead of the generic "Signup failed. Please try again.", users will now see specific errors like:
- "An account with this email already exists. Please login instead."
- "Database connection error. Please try again in a moment."
- "Connection error. Please check your internet connection and try again."
- Or the actual error message for debugging

## Next Steps

After running the migration, monitor the console logs when testing signup to ensure everything works correctly. The improved logging will help identify any remaining issues.

