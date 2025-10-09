# Campaign Leads Migration Instructions

## Overview
This migration creates a `campaign_leads` table to track visitors from marketing campaigns (like Reddit ads).

## Running the Migration

### Option 1: Using Node.js (Recommended)
```bash
# Set your DATABASE_URL environment variable
export DATABASE_URL="your_database_url_here"

# Run the migration script
node migrate-campaign-leads.mjs
```

### Option 2: Using psql directly
```bash
psql "your_database_url_here" -f scripts/010_create_campaign_leads_table.sql
```

### Option 3: Using the API route (if deployed)
Visit: `https://monthlyalerts.com/api/migrate` (if you have an API migration route set up)

## Campaign URLs

After running the migration, the following campaign tracking URLs will be available:

- **Reddit Campaign**: `https://monthlyalerts.com/campaign/reddit`

When visitors click this URL, they will:
1. Be tracked in the `campaign_leads` table
2. Automatically redirected to the home page

## Admin Dashboard Updates

The admin dashboard has been updated to:
- Remove: "Messages Sent" metric
- Add: "Campaign Leads" metric (displays total campaign visits)

## Database Schema

```sql
CREATE TABLE campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_source TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Files Changed

- `scripts/010_create_campaign_leads_table.sql` - SQL migration file
- `migrate-campaign-leads.mjs` - Node.js migration runner
- `app/campaign/reddit/page.tsx` - Reddit campaign tracking page
- `app/actions/campaign.ts` - Campaign data server actions
- `app/admin/page.tsx` - Updated admin dashboard

