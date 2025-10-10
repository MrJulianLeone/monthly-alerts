import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    console.log('[MigrationAPI] Starting migration to add first_name and last_name columns...')
    
    // Add first_name column
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`
    console.log('[MigrationAPI] Added first_name column')
    
    // Add last_name column
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`
    console.log('[MigrationAPI] Added last_name column')
    
    // Update existing users
    await sql`
      UPDATE users 
      SET 
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = CASE 
          WHEN name LIKE '% %' THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
          ELSE ''
        END
      WHERE first_name IS NULL OR last_name IS NULL
    `
    console.log('[MigrationAPI] Updated existing users')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully. Users table now has first_name and last_name columns.' 
    })
  } catch (error: any) {
    console.error('[MigrationAPI] Migration failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

