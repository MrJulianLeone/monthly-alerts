"use server"

import { neon } from "@neondatabase/serverless"
import { redirect } from "next/navigation"
import { hashPassword, createSession } from "@/lib/auth"
import { validatePassword, validateName, sanitizeText } from "@/lib/validation"

const sql = neon(process.env.DATABASE_URL!)

async function verifySetupToken(token: string) {
  try {
    const result = await sql`
      SELECT user_id, expires_at, used
      FROM password_reset_tokens
      WHERE token = ${token}
        AND expires_at > NOW()
        AND used = FALSE
      LIMIT 1
    `

    if (result.length === 0) {
      return { valid: false, error: "Invalid or expired setup link" }
    }

    return { valid: true, userId: result[0].user_id }
  } catch (error: any) {
    console.error("[AccountSetup] Error verifying token:", error)
    return { valid: false, error: "Failed to verify setup link" }
  }
}

export async function setupAccount(formData: FormData) {
  const token = formData.get("token") as string
  const firstName = sanitizeText(formData.get("firstName") as string)
  const lastName = sanitizeText(formData.get("lastName") as string)
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !firstName || !lastName || !password || !confirmPassword) {
    return { error: "All fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  // Validate password strength
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    return { error: passwordValidation.error }
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

  try {
    // Verify token
    const tokenVerification = await verifySetupToken(token)
    if (!tokenVerification.valid) {
      return { error: tokenVerification.error }
    }

    const userId = tokenVerification.userId

    // Hash password
    const hashedPassword = await hashPassword(password)
    const fullName = `${firstName} ${lastName}`

    // Update user account with name and password
    const updateResult = await sql`
      UPDATE users
      SET password_hash = ${hashedPassword},
          first_name = ${firstName},
          last_name = ${lastName},
          name = ${fullName},
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id
    `
    
    if (updateResult.length === 0) {
      console.error("[AccountSetup] Failed to update user - user not found:", userId)
      return { error: "User account not found. Please contact support." }
    }

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE token = ${token}
    `

    console.log("[AccountSetup] Account setup completed for user:", userId)

    // Create session and redirect to dashboard
    await createSession(userId)
    redirect("/dashboard")
  } catch (error: any) {
    console.error("[AccountSetup] Error setting up account:", error)
    return { error: "Failed to complete account setup. Please try again." }
  }
}

