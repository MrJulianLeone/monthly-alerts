import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Add new columns to alerts table
    await sql`
      ALTER TABLE alerts 
      ADD COLUMN IF NOT EXISTS ticker VARCHAR(10),
      ADD COLUMN IF NOT EXISTS company_name TEXT,
      ADD COLUMN IF NOT EXISTS price VARCHAR(50),
      ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20)
    `
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_alerts_ticker ON alerts(ticker)
    `
    
    return NextResponse.json({ success: true, message: "Migration completed successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

