"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface CampaignStats {
  campaign_source: string
  campaign_name: string | null
  total_hits: number
  today_hits: number
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
        cl.campaign_source,
        c.campaign_name,
        COUNT(*) as total_hits,
        COUNT(*) FILTER (
          WHERE DATE(cl.visited_at AT TIME ZONE 'America/New_York') = 
                DATE(NOW() AT TIME ZONE 'America/New_York')
        ) as today_hits,
        MAX(cl.visited_at) as last_visit
      FROM campaign_leads cl
      LEFT JOIN campaigns c ON cl.campaign_source = c.campaign_source
      GROUP BY cl.campaign_source, c.campaign_name
      ORDER BY cl.campaign_source ASC
    `
    return result.map((row: any) => ({
      campaign_source: row.campaign_source,
      campaign_name: row.campaign_name,
      total_hits: Number(row.total_hits),
      today_hits: Number(row.today_hits),
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

export async function updateCampaignName(campaignSource: string, campaignName: string) {
  try {
    // Validate campaign name (optional: allow empty to clear name)
    const trimmedName = campaignName.trim()
    
    if (trimmedName === "") {
      // Delete the campaign name entry if empty
      await sql`
        DELETE FROM campaigns WHERE campaign_source = ${campaignSource}
      `
      return { success: true, message: "Campaign name cleared" }
    }
    
    // Upsert campaign name
    await sql`
      INSERT INTO campaigns (campaign_source, campaign_name, updated_at)
      VALUES (${campaignSource}, ${trimmedName}, NOW())
      ON CONFLICT (campaign_source)
      DO UPDATE SET campaign_name = ${trimmedName}, updated_at = NOW()
    `
    
    return { success: true, message: "Campaign name updated successfully" }
  } catch (error) {
    console.error("[Campaign] Error updating campaign name:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update campaign name"
    return { error: errorMessage }
  }
}

export async function deleteCampaignLeads(campaignSource: string) {
  try {
    // Delete all tracking entries for this campaign
    const result = await sql`
      DELETE FROM campaign_leads 
      WHERE campaign_source = ${campaignSource}
    `
    
    // Also delete the campaign name if it exists
    await sql`
      DELETE FROM campaigns WHERE campaign_source = ${campaignSource}
    `
    
    return { success: true, message: "Campaign tracking data deleted successfully" }
  } catch (error) {
    console.error("[Campaign] Error deleting campaign leads:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete campaign data"
    return { error: errorMessage }
  }
}
