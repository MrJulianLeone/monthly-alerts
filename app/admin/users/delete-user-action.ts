"use server"

import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const sql = neon(process.env.DATABASE_URL!)

async function isAdmin(userId: string): Promise<boolean> {
  const result = await sql`
    SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
  `
  return result.length > 0
}

export async function deleteUser(userId: string) {
  // Verify admin access
  const session = await getSession()
  if (!session) redirect("/login")
  
  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) {
    return { error: "Unauthorized: Admin access required" }
  }

  if (!userId) {
    return { error: "User ID is required" }
  }

  try {
    // Check if user is an admin
    const adminUserCheck = await sql`
      SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
    `

    if (adminUserCheck.length > 0) {
      return { error: "Cannot delete admin users" }
    }

    // Delete user and all related data (cascading deletes should handle most of this)
    // But let's explicitly delete related records for safety
    
    // Delete sessions
    await sql`
      DELETE FROM sessions WHERE user_id = ${userId}::uuid
    `

    // Delete subscriptions
    await sql`
      DELETE FROM subscriptions WHERE user_id = ${userId}::uuid
    `

    // Delete email verification tokens
    await sql`
      DELETE FROM email_verification_tokens WHERE user_id = ${userId}::uuid
    `

    // Delete password reset tokens
    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${userId}::uuid
    `

    // Delete the user
    const result = await sql`
      DELETE FROM users WHERE id = ${userId}::uuid
      RETURNING email
    `

    if (result.length === 0) {
      return { error: "User not found" }
    }

    console.log("[DeleteUser] User deleted:", result[0].email)
    
    // Revalidate the users page
    revalidatePath("/admin/users")
    
    return { success: true, message: "User successfully deleted" }
  } catch (error: any) {
    console.error("[DeleteUser] Error:", error)
    return { error: "Failed to delete user. Please try again." }
  }
}

