import { neon } from '@neondatabase/serverless'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('🚀 Running campaign_leads migration...')
    
    // Create campaign_leads table
    await sql`
      CREATE TABLE IF NOT EXISTS campaign_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_source TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('✅ Created campaign_leads table')
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaign_leads_source ON campaign_leads(campaign_source)
    `
    console.log('✅ Created index on campaign_source column')
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaign_leads_visited_at ON campaign_leads(visited_at DESC)
    `
    console.log('✅ Created index on visited_at column')
    
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()

