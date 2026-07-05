import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  getCurrentUser,
  setSessionCookie,
  setUserCookie,
} from "@/lib/auth";
import { createGuestUser } from "@/lib/onboarding";
import { trackEvent } from "@/lib/geo";

/**
 * Zero-signup entry point. Creates a guest account and a long-lived session
 * cookie so the visitor can start chatting immediately. Idempotent for
 * signed-in visitors: an existing session (guest or full account) is reused.
 * Body (all optional): { name, message, timezone }
 */
export async function POST(request: NextRequest) {
  const existing = await getCurrentUser(request);
  if (existing) {
    return NextResponse.json({ userId: existing.id, existing: true });
  }

  const body = await request.json().catch(() => ({}));
  const displayName =
    typeof body?.name === "string" && body.name.trim()
      ? body.name.trim().slice(0, 60)
      : null;
  const firstMessage =
    typeof body?.message === "string" && body.message.trim()
      ? body.message.trim().slice(0, 500)
      : null;
  const timezone =
    typeof body?.timezone === "string" && body.timezone.length <= 64
      ? body.timezone
      : "UTC";

  const userId = await createGuestUser({ displayName, firstMessage, timezone });

  const session = await createSession(userId, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);
  await setUserCookie(displayName ?? "Friend", "user");
  await trackEvent(request, "guest_start", userId);

  return NextResponse.json({ token: session.token, userId }, { status: 201 });
}
