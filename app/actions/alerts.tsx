"use server"

import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

const sql = neon(process.env.DATABASE_URL!)

export async function sendAlert(formData: FormData) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const userId = formData.get("userId") as string
    const subject = formData.get("subject") as string
    const content = formData.get("content") as string
    const recipientCount = Number(formData.get("recipientCount"))

    if (!subject || !content) {
      return { error: "Subject and content are required" }
    }

    console.log("[SendAlert] Getting active subscribers...")
    // Get all active subscribers
    const subscribers = await sql`
      SELECT u.email, u.first_name, u.last_name
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
    `

    console.log("[SendAlert] Found", subscribers.length, "active subscribers")

    if (subscribers.length === 0) {
      return { error: "No active subscribers to send to" }
    }

    // Send emails to all subscribers
    console.log("[SendAlert] Sending emails...")
    const emailPromises = subscribers.map((subscriber: any) =>
      resend.emails.send({
        from: "MonthlyAlerts <no-reply@alerts.monthlyalerts.com>",
        to: subscriber.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">${subject}</h1>
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${content}
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="color: #6b7280; font-size: 12px;">
              <strong>Disclaimer:</strong> This is informational content only and not investment advice. 
              All investment decisions should be made based on your own research and consultation with qualified financial advisors.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              You're receiving this because you're subscribed to MonthlyAlerts.com. 
              <a href="https://monthlyalerts.com/dashboard/manage-subscription">Manage your subscription</a>
            </p>
          </div>
        `,
      }),
    )

    await Promise.all(emailPromises)
    console.log("[SendAlert] Emails sent successfully")

    // Save alert to database
    await sql`
      INSERT INTO alerts (subject, content, recipient_count, created_by)
      VALUES (${subject}, ${content}, ${subscribers.length}, ${userId}::uuid)
    `

    console.log("[SendAlert] Alert saved to database")
    return { success: true, sentTo: subscribers.length }
  } catch (error: any) {
    console.error("[SendAlert] Error:", error)
    return { error: error.message || "Failed to send alert" }
  }
}
