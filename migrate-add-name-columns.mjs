import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function runMigration() {
  try {
    console.log('🚀 Running migration to add first_name and last_name columns...')
    
    const migrationSQL = readFileSync(
      join(__dirname, 'scripts', '011_add_user_name_columns.sql'),
      'utf8'
    )
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...')
      await sql.unsafe(statement)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('✅ Added first_name and last_name columns to users table')
    console.log('✅ Updated existing users with name data')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

runMigration()

