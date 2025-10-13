"use server"

import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { put, del } from "@vercel/blob"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export async function uploadSampleReport(formData: FormData) {
  try {
    // Verify admin access
    const session = await getSession()
    if (!session) redirect("/login")
    
    const adminCheck = await isAdmin(session.user_id)
    if (!adminCheck) {
      return { error: "Unauthorized: Admin access required" }
    }

    const file = formData.get("file") as File
    
    if (!file) {
      return { error: "No file provided" }
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return { error: "Only PDF files are allowed" }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { error: "File size must be less than 10MB" }
    }

    // Delete any existing sample reports first
    const existingReports = await sql`
      SELECT * FROM sample_reports ORDER BY uploaded_at DESC
    `

    // Delete old files from Vercel Blob
    for (const report of existingReports) {
      try {
        await del(report.file_path)
      } catch (error) {
        console.error("Error deleting old blob:", error)
      }
    }

    // Delete old records from database
    await sql`DELETE FROM sample_reports`

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `sample-monthly-alert-${timestamp}.pdf`
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Save to database
    await sql`
      INSERT INTO sample_reports (filename, file_path, uploaded_by)
      VALUES (${file.name}, ${blob.url}, ${session.user_id}::uuid)
    `

    return { success: true, message: "Sample report uploaded successfully" }
  } catch (error) {
    console.error("Error uploading sample report:", error)
    return { error: "Failed to upload sample report" }
  }
}

export async function deleteSampleReport(reportId: string) {
  try {
    // Verify admin access
    const session = await getSession()
    if (!session) redirect("/login")
    
    const adminCheck = await isAdmin(session.user_id)
    if (!adminCheck) {
      return { error: "Unauthorized: Admin access required" }
    }

    // Get report info
    const reportResult = await sql`
      SELECT * FROM sample_reports WHERE id = ${reportId}::uuid
    `

    if (reportResult.length === 0) {
      return { error: "Report not found" }
    }

    const report = reportResult[0]

    // Delete file from Vercel Blob
    try {
      await del(report.file_path)
    } catch (error) {
      console.error("Error deleting blob:", error)
    }

    // Delete from database
    await sql`DELETE FROM sample_reports WHERE id = ${reportId}::uuid`

    return { success: true, message: "Sample report deleted successfully" }
  } catch (error) {
    console.error("Error deleting sample report:", error)
    return { error: "Failed to delete sample report" }
  }
}

export async function getCurrentSampleReport() {
  try {
    const result = await sql`
      SELECT * FROM sample_reports ORDER BY uploaded_at DESC LIMIT 1
    `
    
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error fetching sample report:", error)
    return null
  }
}

