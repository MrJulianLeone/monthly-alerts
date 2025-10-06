"use server"

import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

const sql = neon(process.env.DATABASE_URL!)

export async function sendMessage(formData: FormData) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const subject = formData.get("subject") as string
    const content = formData.get("content") as string

    if (!subject || !content) {
      return { error: "Subject and content are required" }
    }

    console.log("[SendMessage] Getting active subscribers...")
    // Get all active subscribers (excluding admin users)
    const subscribers = await sql`
      SELECT u.email, u.first_name, u.last_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
      AND s.user_id NOT IN (SELECT user_id FROM admin_users)
    `

    console.log("[SendMessage] Found", subscribers.length, "active subscribers")

    if (subscribers.length === 0) {
      return { error: "No active subscribers to send to" }
    }

    // Send emails to all subscribers
    console.log("[SendMessage] Sending emails...")
    
    const emailPromises = subscribers.map((subscriber: any) =>
      resend.emails.send({
        from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
        to: subscriber.email,
        subject: subject,
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="margin-bottom: 30px;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
        ${content}
      </p>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        <strong>Disclaimer:</strong> This is educational market research and not investment advice. All investment decisions should be made based on your own research and consultation with qualified financial advisors. Past performance does not guarantee future results.
      </p>
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        You are receiving this email because you subscribed to MonthlyAlerts.com. To manage your subscription or unsubscribe, visit: https://monthlyalerts.com/dashboard/manage-subscription
      </p>
    </div>

  </div>
</body>
</html>`,
        headers: {
          'List-Unsubscribe': '<https://monthlyalerts.com/dashboard/manage-subscription>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }),
    )

    await Promise.all(emailPromises)
    console.log("[SendMessage] Emails sent successfully")

    // Note: Messages are NOT logged to the alerts table
    return { success: true, sentTo: subscribers.length }
  } catch (error: any) {
    console.error("[SendMessage] Error:", error)
    return { error: error.message || "Failed to send message" }
  }
}

