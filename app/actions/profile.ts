"use server"

import { getSession, hashPassword, logout } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { validateEmail, validateName, validatePassword, sanitizeText } from "@/lib/validation"
import { stripe } from "@/lib/stripe"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function updateProfile(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const firstName = sanitizeText(formData.get("firstName") as string)
  const lastName = sanitizeText(formData.get("lastName") as string)
  const email = (formData.get("email") as string)?.trim()

  if (!firstName || !lastName || !email) {
    return { error: "All fields are required" }
  }

  // Validate email
  const emailValidation = validateEmail(email)
  if (!emailValidation.valid) {
    return { error: emailValidation.error }
  }

  // Validate names
  const firstNameValidation = validateName(firstName, "First name")
  if (!firstNameValidation.valid) {
    return { error: firstNameValidation.error }
  }

  const lastNameValidation = validateName(lastName, "Last name")
  if (!lastNameValidation.valid) {
    return { error: lastNameValidation.error }
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
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All password fields are required" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.valid) {
    return { error: passwordValidation.error }
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

export async function deleteAccount(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  const confirmation = formData.get("confirmation") as string

  if (confirmation !== "DELETE") {
    return { error: "Please type DELETE to confirm account deletion" }
  }

  try {
    const userId = session.user_id

    // Check if user is an admin
    const adminCheck = await sql`
      SELECT * FROM admin_users WHERE user_id = ${userId}::uuid
    `

    if (adminCheck.length > 0) {
      return { error: "Admin accounts cannot be deleted. Please contact support." }
    }

    // Get active subscription to cancel with Stripe
    const subscriptionResult = await sql`
      SELECT stripe_subscription_id, stripe_customer_id
      FROM subscriptions
      WHERE user_id = ${userId}::uuid
        AND status = 'active'
        AND stripe_subscription_id NOT LIKE 'manual_admin_add%'
      LIMIT 1
    `

    // Cancel Stripe subscription if exists
    if (subscriptionResult.length > 0 && subscriptionResult[0].stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscriptionResult[0].stripe_subscription_id)
        console.log("[DeleteAccount] Canceled Stripe subscription:", subscriptionResult[0].stripe_subscription_id)
      } catch (stripeError: any) {
        console.error("[DeleteAccount] Error canceling Stripe subscription:", stripeError)
        // Continue with deletion even if Stripe cancellation fails
      }
    }

    // Delete user data (in order to avoid foreign key constraints)
    
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
    await sql`
      DELETE FROM users WHERE id = ${userId}::uuid
    `

    console.log("[DeleteAccount] Account deleted successfully:", session.email)

    // Log out the user
    await logout()

    // Redirect to home page
    redirect("/")
  } catch (error: any) {
    console.error("[DeleteAccount] Error:", error)
    return { error: "Failed to delete account. Please try again or contact support." }
  }
}
