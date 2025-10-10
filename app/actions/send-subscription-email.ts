"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubscriptionEmail(email: string, firstName: string, lastName: string) {
  try {
    console.log("[SubscriptionEmail] Sending to:", email)

    await resend.emails.send({
      from: "MonthlyAlerts.com <no-reply@alerts.monthlyalerts.com>",
      to: email,
      subject: "Thank You for Subscribing!",
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
        Hi ${firstName},
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Thank you for subscribing to MonthlyAlerts.com! Your subscription is now active.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        You'll receive monthly alerts as opportunities are found. Each report provides in-depth analysis to help you stay informed about interesting companies and market trends.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        Remember, you can cancel your subscription at any time—no questions asked. Just visit your dashboard to manage your subscription settings.
      </p>
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6; color: #374151;">
        We're excited to have you on board and look forward to sharing our research with you!
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
    })

    console.log("[SubscriptionEmail] Sent successfully to:", email)
    return { success: true }
  } catch (error: any) {
    console.error("[SubscriptionEmail] Error:", error)
    return { error: error.message }
  }
}

