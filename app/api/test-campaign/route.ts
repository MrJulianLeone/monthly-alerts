import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'campaign_leads'
      );
    `
    
    // Get all campaign leads
    const allLeads = await sql`
      SELECT * FROM campaign_leads ORDER BY visited_at DESC
    `
    
    // Get campaign stats
    const stats = await sql`
      SELECT 
        campaign_source,
        COUNT(*) as total_hits,
        MAX(visited_at) as last_visit
      FROM campaign_leads
      GROUP BY campaign_source
      ORDER BY campaign_source ASC
    `
    
    return NextResponse.json({
      tableExists: tableCheck[0].exists,
      totalRecords: allLeads.length,
      allLeads: allLeads,
      stats: stats
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

