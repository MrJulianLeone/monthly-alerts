import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log('[MigrationAPI] Creating campaigns table...')
    
    // Create campaigns table
    await sql`
      CREATE TABLE IF NOT EXISTS campaigns (
        campaign_source TEXT PRIMARY KEY,
        campaign_name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('[MigrationAPI] Created campaigns table')
    
    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaigns_name ON campaigns(campaign_name)
    `
    console.log('[MigrationAPI] Created index on campaign_name column')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully. Campaigns metadata table created.' 
    })
  } catch (error: any) {
    console.error('[MigrationAPI] Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

