import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('🚀 Running migration against production database...')
    
    // Add new columns to alerts table
    await sql`
      ALTER TABLE alerts 
      ADD COLUMN IF NOT EXISTS ticker VARCHAR(10),
      ADD COLUMN IF NOT EXISTS company_name TEXT,
      ADD COLUMN IF NOT EXISTS price VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20)
    `
    console.log('✅ Added columns: ticker, company_name, price, sentiment')
    
    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_alerts_ticker ON alerts(ticker)
    `
    console.log('✅ Created index on ticker column')
    
    console.log('🎉 Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

runMigration()

