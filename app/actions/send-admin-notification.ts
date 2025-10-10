"use server"

import { Resend } from "resend"
import { neon } from "@neondatabase/serverless"

const resend = new Resend(process.env.RESEND_API_KEY)
const sql = neon(process.env.DATABASE_URL!)

export async function sendAdminNotification(
  userEmail: string,
  firstName: string,
  lastName: string,
  userId: string,
  subscriptionId: string
) {
  try {
    console.log("[AdminNotification] Sending notification for new subscriber:", userEmail)

    // Get all admin emails
    const admins = await sql`
      SELECT u.email, u.first_name
      FROM admin_users au
      JOIN users u ON au.user_id = u.id
    `

    if (admins.length === 0) {
      console.log("[AdminNotification] No admin users found")
      return { success: true }
    }

    // Get user registration date
    const userDetails = await sql`
      SELECT created_at FROM users WHERE id = ${userId}::uuid
    `
    const registeredDate = userDetails[0]?.created_at 
      ? new Date(userDetails[0].created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/New_York'
        })
      : 'Unknown'

    const subscribedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/New_York'
    })

    // Send email to all admins
    const emailPromises = admins.map((admin: any) =>
      resend.emails.send({
        from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
        to: admin.email,
        subject: "🎉 New Subscription",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
        <h2 style="margin: 0; font-size: 18px; color: #16a34a;">
          🎉 New Subscription Received
        </h2>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Hi ${admin.first_name},
      </p>
      
      <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Great news! A new user has just subscribed to MonthlyAlerts.com.
      </p>

      <div style="background-color: #f9fafb; border-radius: 6px; padding: 20px; margin: 25px 0;">
        <h3 style="margin: 0 0 15px 0; font-size: 14px; font-weight: 600; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
          Subscriber Details
        </h3>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280; width: 40%;">Name:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 500;">${firstName} ${lastName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Email:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 500;">${userEmail}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">User ID:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-family: monospace; font-size: 11px;">${userId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Subscription ID:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827; font-family: monospace; font-size: 11px;">${subscriptionId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Registered On:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827;">${registeredDate} EST</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #6b7280;">Subscribed On:</td>
            <td style="padding: 8px 0; font-size: 13px; color: #111827;">${subscribedDate} EST</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <a href="https://monthlyalerts.com/admin/subscriptions" 
           style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 13px; font-weight: 500;">
          View All Subscriptions
        </a>
      </div>

      <p style="margin: 25px 0 0 0; font-size: 13px; line-height: 1.6; color: #6b7280;">
        This is an automated notification sent to all administrators.
      </p>
    </div>

  </div>
</body>
</html>`,
      })
    )

    await Promise.all(emailPromises)
    console.log("[AdminNotification] Notification sent to", admins.length, "admin(s)")
    return { success: true }
  } catch (error: any) {
    console.error("[AdminNotification] Error:", error)
    return { error: error.message }
  }
}

