import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/admin";
import { requireAdmin } from "@/lib/api";
import { appUrl } from "@/lib/email";
import {
  outreachAddress,
  outreachConfigured,
  outreachEnabled,
  outreachProfile,
  outreachSend,
} from "@/lib/outreach";

export const maxDuration = 60;

/**
 * Sending check for the setup page: confirms the switch and Resend key, and
 * optionally sends a test email to the admin so inbox placement and the
 * SPF/DKIM/DMARC headers can be eyeballed. Admin-only.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  if (!outreachConfigured()) {
    return NextResponse.json({
      configured: false,
      error: outreachEnabled()
        ? "RESEND_API_KEY is missing."
        : "OUTREACH_ENABLED is not \"true\" — set it in Vercel (Production) and redeploy.",
    });
  }

  const body = await request.json().catch(() => ({}));
  try {
    const profile = await outreachProfile();
    let testSent = false;
    if (body?.send_test === true) {
      await outreachSend({
        to: ADMIN_EMAIL,
        subject: "MonthlyAlerts outreach test",
        text:
          "This is a test from the prospecting pipeline.\n\n" +
          `It was sent from ${outreachAddress()} through Resend, exactly like a real outreach email. ` +
          "If it landed in your inbox (not Promotions or Spam), open Show original and confirm SPF, DKIM " +
          "and DMARC all say PASS before approving real sends.\n\n" +
          `Reply to this email: it should appear in ${appUrl()}/admin/inbox.`,
        listUnsubscribeUrl: `${appUrl()}/`,
      });
      testSent = true;
    }
    return NextResponse.json({
      configured: true,
      mailbox: `${profile.fromName} <${profile.emailAddress}>`,
      testSent,
    });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      error: err instanceof Error ? err.message : "Send failed",
    });
  }
}
