import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { headers } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const campaignId = params.id

  // Validate campaign ID is a number
  if (!/^\d+$/.test(campaignId)) {
    redirect("/")
  }

  // Get visitor information
  const headersList = headers()
  const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
  const userAgent = headersList.get("user-agent") || "unknown"

  // Track the visit
  try {
    await sql`
      INSERT INTO campaign_leads (campaign_source, ip_address, user_agent)
      VALUES (${campaignId}, ${ipAddress}, ${userAgent})
    `
  } catch (error) {
    console.error("[Campaign] Error tracking visit:", error)
    // Continue to redirect even if tracking fails
  }

  // Redirect to home page
  redirect("/")
}

