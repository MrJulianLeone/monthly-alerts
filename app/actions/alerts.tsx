"use server"

import { redirect } from "next/navigation"
import { neon } from "@neondatabase/serverless"
import { Resend } from "resend"

const sql = neon(process.env.DATABASE_URL!)

export async function sendAlert(formData: FormData) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const userId = formData.get("userId") as string
  const subject = formData.get("subject") as string
  const content = formData.get("content") as string
  const recipientCount = Number(formData.get("recipientCount"))

  if (!subject || !content) {
    throw new Error("Subject and content are required")
  }

  // Get all active subscribers
  const subscribers = await sql`
    SELECT u.email, u.name
    FROM subscriptions s
    JOIN neon_auth.users_sync u ON s.user_id = u.id
    WHERE s.status = 'active'
  `

  // Send emails to all subscribers
  const emailPromises = subscribers.map((subscriber: any) =>
    resend.emails.send({
      from: "MonthlyAlerts <alerts@monthlyalerts.com>",
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

  // Save alert to database
  await sql`
    INSERT INTO alerts (subject, content, recipient_count, created_by)
    VALUES (${subject}, ${content}, ${recipientCount}, ${userId})
  `

  redirect("/admin")
}
