"use server"

import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export async function deleteMessage(messageId: string) {
  try {
    // Check admin authentication
    const session = await getSession()
    if (!session) {
      redirect("/login")
    }

    const adminCheck = await isAdmin(session.user_id)
    if (!adminCheck) {
      return { error: "Unauthorized: Admin access required" }
    }

    // Delete the message
    await sql`
      DELETE FROM messages WHERE id = ${messageId}::uuid
    `

    console.log("[DeleteMessage] Successfully deleted message:", messageId)
    return { success: true }
  } catch (error: any) {
    console.error("[DeleteMessage] Error:", error)
    return { error: error.message || "Failed to delete message" }
  }
}

