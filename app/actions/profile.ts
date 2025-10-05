"use server"

import { requireAuth } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

const sql = neon(process.env.DATABASE_URL!)

export async function updateProfile(formData: FormData) {
  const session = await requireAuth()

  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return { error: "Name and email are required" }
  }

  // Check if email is already taken by another user
  if (email !== session.email) {
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE email = ${email} AND id != ${session.user_id}
      LIMIT 1
    `

    if (existingUser.length > 0) {
      return { error: "Email is already in use" }
    }
  }

  // Update user profile
  await sql`
    UPDATE users 
    SET name = ${name}, email = ${email}, updated_at = NOW()
    WHERE id = ${session.user_id}
  `

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
