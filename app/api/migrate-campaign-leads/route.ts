import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
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
    
    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaign_leads_source ON campaign_leads(campaign_source)
    `
    
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaign_leads_visited_at ON campaign_leads(visited_at DESC)
    `
    
    return NextResponse.json({ 
      success: true, 
      message: "Campaign leads table created successfully. You can now track campaign visits!" 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

