"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, firstName: string, lastName: string) {
  try {
    console.log("[WelcomeEmail] Sending to:", email)

    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Welcome to MonthlyAlerts.com!",
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
        Hi there,
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Thanks for joining MonthlyAlerts.com! You're now part of our community of curious investors who love discovering interesting companies.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Our newsletter comes at least once a month, sometimes more often when opportunities arise. Each report blends fundamental and technical analysis to give you a clear, well-rounded view of the companies we research.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Please note: our content is for educational purposes only and is not investment advice.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Glad to have you with us. Stay tuned for your first alert!
      </p>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
        — The MonthlyAlerts Team
      </p>
    </div>

    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
      <p style="margin: 0 0 10px 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        <strong>Disclaimer:</strong> This is educational market research and not investment advice. All investment decisions should be made based on your own research and consultation with qualified financial advisors. Past performance does not guarantee future results.
      </p>
      <p style="margin: 0; font-size: 11px; line-height: 1.5; color: #6b7280;">
        You are receiving this email because you registered at MonthlyAlerts.com. To manage your subscription or unsubscribe, visit: https://monthlyalerts.com/dashboard/manage-subscription
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
