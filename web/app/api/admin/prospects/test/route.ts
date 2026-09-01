import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/admin";
import { requireAdmin } from "@/lib/api";
import { outreachConfigured, outreachProfile, outreachSend } from "@/lib/outreach";

export const maxDuration = 60;

/**
 * Gmail connection check for the setup page: verifies the OAuth credentials
 * by loading the mailbox profile, and optionally sends a test email to the
 * admin so deliverability to Gmail can be eyeballed. Admin-only.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  if (!outreachConfigured()) {
    return NextResponse.json({
      configured: false,
      error:
        "Missing env vars — set OUTREACH_GOOGLE_CLIENT_ID, OUTREACH_GOOGLE_CLIENT_SECRET, and OUTREACH_GOOGLE_REFRESH_TOKEN.",
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
          "If this landed in your inbox (not spam), the outreach mailbox is working. " +
          "Check the headers for SPF/DKIM/DMARC = PASS before sending real outreach.",
        fromName: process.env.OUTREACH_FROM_NAME ?? "MonthlyAlerts",
      });
      testSent = true;
    }
    return NextResponse.json({ configured: true, mailbox: profile.emailAddress, testSent });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      error: err instanceof Error ? err.message : "Gmail API call failed",
    });
  }
}
