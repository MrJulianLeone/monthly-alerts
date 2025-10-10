"use server"

import { Resend } from "resend"
import { neon } from "@neondatabase/serverless"
import { getBaseUrl } from "@/lib/env"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAccountSetupEmail(userId: string, email: string) {
  try {
    // Generate setup token (using password_reset_tokens table)
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store token in database
    await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
      VALUES (${userId}::uuid, ${token}, ${expiresAt}, FALSE)
    `

    // Create setup URL
    const baseUrl = getBaseUrl()
    const setupUrl = `${baseUrl}/setup-account?token=${token}`

    // Send email
    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Complete Your Account Setup",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="margin-bottom: 30px;">
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        You've been added to MonthlyAlerts.com by an administrator. Complete your account setup to access your subscription and start receiving monthly research alerts about interesting companies.
      </p>

      <div style="margin: 30px 0;">
        <a href="${setupUrl}" 
           style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-size: 14px; font-weight: 500;">
          Complete Account Setup
        </a>
      </div>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Or copy and paste this link into your browser:
      </p>
      <p style="margin: 0 0 15px 0; font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all;">
        ${setupUrl}
      </p>

      <p style="margin: 20px 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        This setup link will expire in 7 days.
      </p>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        During setup, you'll be able to:
      </p>
      <ul style="margin: 0 0 15px 0; padding-left: 20px; font-size: 14px; line-height: 1.6; color: #374151;">
        <li>Set your password</li>
        <li>Add your name</li>
        <li>Access your dashboard and alerts</li>
      </ul>

      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
        If you didn't expect this email, you can safely ignore it.
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

    console.log("[AccountSetup] Setup email sent to:", email)
    return { success: true }
  } catch (error: any) {
    console.error("[AccountSetup] Error sending setup email:", error)
    return { error: error.message }
  }
}

