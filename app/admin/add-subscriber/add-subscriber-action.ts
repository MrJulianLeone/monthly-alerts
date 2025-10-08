"use server"

import { neon } from "@neondatabase/serverless"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { sendAccountSetupEmail } from "@/app/actions/send-account-setup-email"
import crypto from "crypto"

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
    // Check if user exists
    const userResult = await sql`
      SELECT id, email, email_verified, first_name, last_name
      FROM users
      WHERE email = ${email}
    `

    let user
    let isNewUser = false

    if (userResult.length === 0) {
      // User doesn't exist - create a new account
      const tempPassword = crypto.randomBytes(32).toString('hex') // Temporary, will be replaced during setup
      
      const newUserResult = await sql`
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          name,
          email_verified,
          created_at,
          updated_at
        ) VALUES (
          ${email},
          ${tempPassword},
          'New',
          'User',
          'New User',
          TRUE,
          NOW(),
          NOW()
        )
        RETURNING id, email, first_name, last_name
      `
      
      user = newUserResult[0]
      isNewUser = true
      console.log("[AddSubscriber] Created new user account:", user.email)
    } else {
      user = userResult[0]
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

    // Send account setup email for new users
    if (isNewUser) {
      await sendAccountSetupEmail(user.id, user.email)
      return { 
        success: true, 
        message: `Created account for ${user.email} and sent setup invitation. They can complete their profile and set a password via email.` 
      }
    }
    
    return { 
      success: true, 
      message: `Successfully added ${user.first_name} ${user.last_name} (${user.email}) to the subscriber list` 
    }
  } catch (error: any) {
    console.error("[AddSubscriber] Error:", error)
    return { error: "Failed to add user to subscriber list. Please try again." }
  }
}

