"use server"

import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function trackPageView(pagePath: string) {
  try {
    // Increment the view count for this page for today's date
    await sql`
      INSERT INTO page_views (page_path, view_date, view_count, last_updated)
      VALUES (${pagePath}, CURRENT_DATE, 1, NOW())
      ON CONFLICT (page_path, view_date) 
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

export async function getTodayPageViews(pagePath: string) {
  try {
    const result = await sql`
      SELECT view_count 
      FROM page_views 
      WHERE page_path = ${pagePath} 
        AND view_date = CURRENT_DATE
    `
    return result.length > 0 ? Number(result[0].view_count) : 0
  } catch (error) {
    console.error("Error fetching today's page views:", error)
    return 0
  }
}

export async function getPageViews(pagePath: string) {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(view_count), 0) as total 
      FROM page_views 
      WHERE page_path = ${pagePath}
    `
    return Number(result[0].total)
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

export async function getPageViewsByDateRange(pagePath: string, days: number = 7) {
  try {
    const result = await sql`
      SELECT view_date, view_count
      FROM page_views
      WHERE page_path = ${pagePath}
        AND view_date >= CURRENT_DATE - ${days}
      ORDER BY view_date DESC
    `
    return result
  } catch (error) {
    console.error("Error fetching page views by date range:", error)
    return []
  }
}
