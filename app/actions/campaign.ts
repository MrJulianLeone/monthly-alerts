"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface CampaignStats {
  campaign_source: string
  total_hits: number
  last_visit: string | null
}

export async function getCampaignLeadsCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM campaign_leads
    `
    return Number(result[0].count)
  } catch (error) {
    console.error("[Campaign] Error fetching campaign leads count:", error)
    return 0
  }
}

export async function getAllCampaignStats(): Promise<CampaignStats[]> {
  try {
    const result = await sql`
      SELECT 
        campaign_source,
        COUNT(*) as total_hits,
        MAX(visited_at) as last_visit
      FROM campaign_leads
      GROUP BY campaign_source
      ORDER BY campaign_source ASC
    `
    return result.map((row: any) => ({
      campaign_source: row.campaign_source,
      total_hits: Number(row.total_hits),
      last_visit: row.last_visit
    }))
  } catch (error) {
    console.error("[Campaign] Error fetching campaign stats:", error)
    return []
  }
}

export async function getCampaignLeadsBySource(source: string): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM campaign_leads
      WHERE campaign_source = ${source}
    `
    return Number(result[0].count)
  } catch (error) {
    console.error("[Campaign] Error fetching campaign leads count for source:", source, error)
    return 0
  }
}

