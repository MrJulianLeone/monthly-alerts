import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken, hashToken } from "@/lib/auth";
import { sendParentSetupEmail } from "@/lib/email";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

const INVITE_DAYS = 7;

/**
 * Under-16 onboarding entry point: the child enters their parent's email and
 * the parent receives a professional setup email with a secure link.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parentEmail = body?.parentEmail;
  if (!parentEmail || typeof parentEmail !== "string" || !/^\S+@\S+\.\S+$/.test(parentEmail)) {
    return jsonError("A valid parent email is required");
  }

  // Basic abuse guard: cap pending invites per parent email.
  const pending = (await sql()`
    SELECT count(*)::int AS n FROM parent_invites
    WHERE parent_email = ${parentEmail} AND status = 'pending' AND expires_at > now()
  `) as { n: number }[];
  if (pending[0].n >= 3) {
    return jsonError("A setup email was already sent to this address. Please check the inbox.", 429);
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000);
  const inserted = (await sql()`
    INSERT INTO parent_invites (parent_email, token_hash, expires_at)
    VALUES (${parentEmail}, ${hashToken(token)}, ${expiresAt.toISOString()})
    RETURNING id
  `) as { id: string }[];

  try {
    await sendParentSetupEmail(parentEmail, token);
  } catch (error) {
    // Don't leave an unusable pending invite behind, and tell the user the truth.
    await sql()`DELETE FROM parent_invites WHERE id = ${inserted[0].id}`.catch(() => {});
    console.error("Parent setup email failed:", error);
    return jsonError(
      "We couldn't send the email to your parent right now. Please try again in a few minutes.",
      502
    );
  }
  await trackEvent(request, "parent_invite_sent");

  return NextResponse.json({ ok: true, message: "Setup email sent to your parent." }, { status: 201 });
}
