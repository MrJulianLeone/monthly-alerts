# Campaign Leads Migration Instructions

## Overview
This migration creates a `campaign_leads` table to track visitors from marketing campaigns using numbered campaign IDs.

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

## Campaign URLs

After running the migration, you can create numbered campaign tracking URLs:

- **Campaign 1**: `https://monthlyalerts.com/campaign/1`
- **Campaign 2**: `https://monthlyalerts.com/campaign/2`
- **Campaign 3**: `https://monthlyalerts.com/campaign/3`
- And so on...

### How It Works

When visitors click a campaign URL, they will:
1. Be tracked in the `campaign_leads` table with the campaign ID
2. Automatically redirected to the home page
3. Their IP address, user agent, and visit time are recorded

### Example: Reddit Ad Campaign

For your Reddit ad campaign, use: `https://monthlyalerts.com/campaign/1`

You can assign different numbers to different campaigns:
- Reddit ads → Campaign 1
- Facebook ads → Campaign 2
- Twitter ads → Campaign 3
- etc.

## Admin Dashboard Updates

The admin dashboard has been updated to:
- ✅ Remove: "Messages Sent" metric  
- ✅ Add: "Campaign Leads" table showing all campaigns
- ✅ Display campaign ID, URL, total hits, and last visit for each campaign
- ✅ Table matches the style of other admin tables

### Campaign Tracking View

The admin dashboard now shows:
- **Campaign ID**: The number assigned to the campaign (#1, #2, etc.)
- **Campaign URL**: The full tracking URL
- **Total Hits**: Number of visitors who clicked the campaign link
- **Last Visit**: Timestamp of the most recent visit

You can also visit `/admin/campaigns` for a dedicated campaign tracking page.

## Database Schema

```sql
CREATE TABLE campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_source TEXT NOT NULL,  -- Stores the campaign ID (1, 2, 3, etc.)
  ip_address TEXT,
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Files Changed

- `scripts/010_create_campaign_leads_table.sql` - SQL migration file
- `migrate-campaign-leads.mjs` - Node.js migration runner
- `app/campaign/[id]/page.tsx` - Dynamic campaign tracking page (supports any number)
- `app/actions/campaign.ts` - Campaign data server actions
- `app/admin/page.tsx` - Updated admin dashboard with campaigns table
- `app/admin/campaigns/page.tsx` - Dedicated campaigns tracking page
- `app/admin/campaigns/admin-campaigns-table.tsx` - Campaign stats table component

