"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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

