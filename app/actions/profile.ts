"use server"

import { requireAuth, hashPassword } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function updateProfile(formData: FormData) {
  const session = await requireAuth()

  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string

  if (!firstName || !lastName || !email) {
    return { error: "All fields are required" }
  }

  // Check if email is already taken by another user
  if (email !== session.email) {
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${session.user_id}::uuid
      LIMIT 1
    `

    if (existingUser.length > 0) {
      return { error: "Email is already in use" }
    }
  }

  // Update user profile
  const fullName = `${firstName} ${lastName}`
  await sql`
    UPDATE users 
    SET first_name = ${firstName}, last_name = ${lastName}, name = ${fullName}, email = ${email}, updated_at = NOW()
    WHERE id = ${session.user_id}::uuid
  `

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

export async function changePassword(formData: FormData) {
  const session = await requireAuth()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  // Verify current password
  const result = await sql`
    SELECT password_hash FROM users WHERE id = ${session.user_id}::uuid
  `

  const user = result[0]
  if (!user) {
    return { error: "User not found" }
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isValid) {
    return { error: "Current password is incorrect" }
  }

  // Update password
  const hashedPassword = await hashPassword(newPassword)
  await sql`
    UPDATE users 
    SET password_hash = ${hashedPassword}, updated_at = NOW()
    WHERE id = ${session.user_id}::uuid
  `

  return { success: true }
}
