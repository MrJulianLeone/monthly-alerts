"use server"

import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"
import { getBaseUrl } from "@/lib/env"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate and send email verification token
 */
export async function sendVerificationEmail(userId: string, email: string, firstName: string) {
  try {
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store token in database
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, expires_at)
      VALUES (${userId}::uuid, ${token}, ${expiresAt})
    `

    // Create verification URL
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`

    // Send email
    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Verify Your Email Address - MonthlyAlerts.com",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="margin-bottom: 30px;">
      <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #111827;">Verify Your Email Address</h1>
      
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Hi ${firstName},
      </p>
      
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Thank you for signing up for MonthlyAlerts.com! To complete your registration and start receiving alerts, please verify your email address by clicking the button below.
      </p>

      <div style="margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Verify Email Address
        </a>
      </div>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 15px 0; font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all;">
        ${verificationUrl}
      </p>

      <p style="margin: 20px 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        This verification link will expire in 24 hours.
      </p>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        If you didn't create an account with MonthlyAlerts.com, you can safely ignore this email.
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

    console.log("[EmailVerification] Verification email sent to:", email)
    return { success: true }
  } catch (error: any) {
    console.error("[EmailVerification] Error sending verification email:", error)
    return { error: error.message }
  }
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string) {
  try {
    // Find token
    const result = await sql`
      SELECT user_id, expires_at
      FROM email_verification_tokens
      WHERE token = ${token}
        AND expires_at > NOW()
      LIMIT 1
    `

    if (result.length === 0) {
      return { error: "Invalid or expired verification link" }
    }

    const { user_id } = result[0]

    // Get user details for welcome email
    const userResult = await sql`
      SELECT email, first_name, last_name
      FROM users
      WHERE id = ${user_id}::uuid
    `

    if (userResult.length === 0) {
      return { error: "User not found" }
    }

    const user = userResult[0]

    // Mark email as verified
    await sql`
      UPDATE users
      SET email_verified = TRUE
      WHERE id = ${user_id}::uuid
    `

    // Delete the used token
    await sql`
      DELETE FROM email_verification_tokens
      WHERE token = ${token}
    `

    console.log("[EmailVerification] Email verified for user:", user_id)

    // Send welcome email now that email is verified
    console.log("[EmailVerification] Sending welcome email...")
    const { sendWelcomeEmail } = await import("./send-welcome-email")
    await sendWelcomeEmail(user.email, user.first_name, user.last_name)
    console.log("[EmailVerification] Welcome email sent")

    return { success: true, userId: user_id }
  } catch (error: any) {
    console.error("[EmailVerification] Error verifying token:", error)
    return { error: "Failed to verify email. Please try again." }
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(userId: string) {
  try {
    // Get user details
    const userResult = await sql`
      SELECT email, first_name, email_verified
      FROM users
      WHERE id = ${userId}::uuid
    `

    if (userResult.length === 0) {
      return { error: "User not found" }
    }

    const user = userResult[0]

    if (user.email_verified) {
      return { error: "Email is already verified" }
    }

    // Delete old tokens
    await sql`
      DELETE FROM email_verification_tokens
      WHERE user_id = ${userId}::uuid
    `

    // Send new verification email
    return await sendVerificationEmail(userId, user.email, user.first_name)
  } catch (error: any) {
    console.error("[EmailVerification] Error resending verification email:", error)
    return { error: "Failed to resend verification email" }
  }
}

