"use server"

import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"
import { hashPassword } from "@/lib/auth"
import { validatePassword } from "@/lib/validation"
import { checkRateLimit } from "@/lib/rate-limit"
import { getBaseUrl } from "@/lib/env"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Request password reset - sends reset email
 */
export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string)?.trim()

  if (!email) {
    return { error: "Email is required" }
  }

  // Rate limit password reset requests
  const rateLimit = await checkRateLimit(email, "password-reset", 3, 60)
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetAt.getTime() - Date.now()) / 60000)
    return { error: `Too many password reset attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` }
  }

  try {
    // Check if user exists
    const userResult = await sql`
      SELECT id, first_name
      FROM users
      WHERE email = ${email}
    `

    // Always return success even if user doesn't exist (security best practice)
    if (userResult.length === 0) {
      console.log("[PasswordReset] User not found for email:", email)
      return { 
        success: true, 
        message: "If an account exists with this email, you will receive a password reset link shortly." 
      }
    }

    const user = userResult[0]

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${user.id}::uuid, ${token}, ${expiresAt})
    `

    // Create reset URL
    const baseUrl = getBaseUrl()
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Send email
    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Reset Your Password - MonthlyAlerts.com",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="margin-bottom: 30px;">
      <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #111827;">Reset Your Password</h1>
      
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Hi ${user.first_name},
      </p>
      
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        We received a request to reset your password for your MonthlyAlerts.com account. Click the button below to create a new password.
      </p>

      <div style="margin: 30px 0;">
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Reset Password
        </a>
      </div>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 15px 0; font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all;">
        ${resetUrl}
      </p>

      <p style="margin: 20px 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        This password reset link will expire in 1 hour.
      </p>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
      </p>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        This is an automated email from MonthlyAlerts.com. Please do not reply to this email.
      </p>
    </div>

  </div>
</body>
</html>`,
    })

    console.log("[PasswordReset] Reset email sent to:", email)
    return { 
      success: true, 
      message: "If an account exists with this email, you will receive a password reset link shortly." 
    }
  } catch (error: any) {
    console.error("[PasswordReset] Error sending reset email:", error)
    return { error: "Failed to process password reset request. Please try again." }
  }
}

/**
 * Verify password reset token
 */
export async function verifyResetToken(token: string) {
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
      return { valid: false, error: "Invalid or expired reset link" }
    }

    return { valid: true, userId: result[0].user_id }
  } catch (error: any) {
    console.error("[PasswordReset] Error verifying token:", error)
    return { valid: false, error: "Failed to verify reset link" }
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token || !password || !confirmPassword) {
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

  try {
    // Verify token
    const tokenVerification = await verifyResetToken(token)
    if (!tokenVerification.valid) {
      return { error: tokenVerification.error }
    }

    const userId = tokenVerification.userId

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await sql`
      UPDATE users
      SET password_hash = ${hashedPassword}
      WHERE id = ${userId}::uuid
    `

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used = TRUE
      WHERE token = ${token}
    `

    // Invalidate all existing sessions for this user (force re-login)
    await sql`
      DELETE FROM sessions
      WHERE user_id = ${userId}::uuid
    `

    console.log("[PasswordReset] Password reset successful for user:", userId)
    return { success: true, message: "Password reset successful. Please log in with your new password." }
  } catch (error: any) {
    console.error("[PasswordReset] Error resetting password:", error)
    return { error: "Failed to reset password. Please try again." }
  }
}

