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

export async function addUserToSubscriberList(formData: FormData) {
  // Verify admin access
  const session = await getSession()
  if (!session) redirect("/login")
  
  const adminCheck = await isAdmin(session.user_id)
  if (!adminCheck) {
    return { error: "Unauthorized: Admin access required" }
  }

  const email = (formData.get("email") as string)?.trim()

  if (!email) {
    return { error: "Email address is required" }
  }

  try {
    // Check if user exists and is verified
    const userResult = await sql`
      SELECT id, email, email_verified, first_name, last_name
      FROM users
      WHERE email = ${email}
    `

    if (userResult.length === 0) {
      return { error: "No user found with this email address" }
    }

    const user = userResult[0]

    if (!user.email_verified) {
      return { error: "User email is not verified. Please verify email before adding to subscriber list." }
    }

    // Check if user already has an active subscription
    const existingSubResult = await sql`
      SELECT id, status
      FROM subscriptions
      WHERE user_id = ${user.id}::uuid
      AND status = 'active'
    `

    if (existingSubResult.length > 0) {
      return { error: "User already has an active subscription" }
    }

    // Create manual subscription (no Stripe)
    await sql`
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        current_period_end,
        created_at,
        updated_at
      ) VALUES (
        ${user.id}::uuid,
        'manual_admin_add',
        'manual_admin_add_' || ${user.id}::text,
        'active',
        NOW() + INTERVAL '100 years',
        NOW(),
        NOW()
      )
    `

    console.log("[AddSubscriber] User added to subscriber list:", user.email)
    
    return { 
      success: true, 
      message: `Successfully added ${user.first_name} ${user.last_name} (${user.email}) to the subscriber list` 
    }
  } catch (error: any) {
    console.error("[AddSubscriber] Error:", error)
    return { error: "Failed to add user to subscriber list. Please try again." }
  }
}

