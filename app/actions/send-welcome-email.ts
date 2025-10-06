"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, firstName: string, lastName: string) {
  try {
    console.log("[WelcomeEmail] Sending to:", email)

    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Welcome to MonthlyAlerts.com - Your Subscription is Active!",
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
        Hello ${firstName},
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Thank you for subscribing to MonthlyAlerts.com! Your subscription is now active.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        You'll receive monthly AI-curated market research highlighting fast-growing companies and emerging opportunities. Each alert is carefully crafted to provide educational insights and factual analysis.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        <strong>Important:</strong> Please check your spam or junk folder and mark this email as "Not Spam" to ensure you receive future alerts. Consider adding no-reply@alerts.monthlyalerts.com to your contacts.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Your next alert will arrive within the month.
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Best regards,<br>
        The MonthlyAlerts.com Team
      </p>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        <strong>Disclaimer:</strong> This is educational market research and not investment advice. All investment decisions should be made based on your own research and consultation with qualified financial advisors.
      </p>
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        Manage your subscription: https://monthlyalerts.com/dashboard/manage-subscription
      </p>
    </div>

  </div>
</body>
</html>`,
      headers: {
        'List-Unsubscribe': '<https://monthlyalerts.com/dashboard/manage-subscription>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    console.log("[WelcomeEmail] Sent successfully to:", email)
    return { success: true }
  } catch (error: any) {
    console.error("[WelcomeEmail] Error:", error)
    return { error: error.message }
  }
}
