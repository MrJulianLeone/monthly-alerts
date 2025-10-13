import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log('[MigrationAPI] Creating sample_reports table...')
    
    // Create sample_reports table
    await sql`
      CREATE TABLE IF NOT EXISTS sample_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploaded_by UUID NOT NULL,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `
    console.log('[MigrationAPI] Created sample_reports table')
    
    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_sample_reports_uploaded_at 
      ON sample_reports(uploaded_at DESC)
    `
    console.log('[MigrationAPI] Created index on uploaded_at column')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully. Sample reports table created.' 
    })
  } catch (error: any) {
    console.error('[MigrationAPI] Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

