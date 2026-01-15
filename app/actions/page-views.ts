"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function trackPageView(pagePath: string) {
  try {
    // Increment the view count for this page
    await sql`
      INSERT INTO page_views (page_path, view_count, last_updated)
      VALUES (${pagePath}, 1, NOW())
      ON CONFLICT (page_path) 
      DO UPDATE SET 
        view_count = page_views.view_count + 1,
        last_updated = NOW()
    `
    return { success: true }
  } catch (error) {
    console.error("Error tracking page view:", error)
    return { success: false }
  }
}

export async function getPageViews(pagePath: string) {
  try {
    const result = await sql`
      SELECT view_count FROM page_views WHERE page_path = ${pagePath}
    `
    return result.length > 0 ? Number(result[0].view_count) : 0
  } catch (error) {
    console.error("Error fetching page views:", error)
    return 0
  }
}

export async function getTotalPageViews() {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(view_count), 0) as total FROM page_views
    `
    return Number(result[0].total)
  } catch (error) {
    console.error("Error fetching total page views:", error)
    return 0
  }
}
