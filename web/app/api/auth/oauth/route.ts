import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ageFromDob, createSession, setSessionCookie } from "@/lib/auth";
import { verifyAppleToken, verifyGoogleToken } from "@/lib/oauth";
import { createCoachedUser } from "@/lib/onboarding";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

/**
 * Sign in with Apple / Google for users 16+.
 * Body: { provider: "apple"|"google", token, profile?: { displayName, dateOfBirth, ... } }
 * Existing accounts sign in directly; new accounts need the profile object
 * (DOB is required for all users). Returns needsProfile=true when missing.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.provider || !body?.token) return jsonError("provider and token are required");

  let identity;
  try {
    identity =
      body.provider === "apple"
        ? await verifyAppleToken(body.token)
        : body.provider === "google"
          ? await verifyGoogleToken(body.token)
          : null;
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Token verification failed", 401);
  }
  if (!identity) return jsonError("Unknown provider");

  const existing = (await (body.provider === "apple"
    ? sql()`SELECT id FROM users WHERE apple_sub = ${identity.sub} AND deleted_at IS NULL`
    : sql()`SELECT id FROM users WHERE google_sub = ${identity.sub} AND deleted_at IS NULL`)) as {
    id: string;
  }[];

  let userId: string;
  if (existing.length > 0) {
    userId = existing[0].id;
  } else {
    const profile = body.profile;
    if (!profile?.dateOfBirth || !profile?.displayName) {
      return NextResponse.json({ needsProfile: true }, { status: 200 });
    }
    if (ageFromDob(profile.dateOfBirth) < 16) {
      return jsonError(
        "Users under 16 need a parent to set up their account. Please restart onboarding.",
        403
      );
    }
    const email = identity.email ?? profile.email;
    if (!email) return jsonError("An email address is required");

    userId = await createCoachedUser({
      email,
      authProvider: body.provider,
      appleSub: body.provider === "apple" ? identity.sub : undefined,
      googleSub: body.provider === "google" ? identity.sub : undefined,
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender ?? null,
      heightCm: profile.heightCm ?? null,
      weightKg: profile.weightKg ?? null,
      goal: profile.goal ?? null,
      timezone: profile.timezone ?? "UTC",
    });
    await trackEvent(request, "signup", userId);
  }

  const session = await createSession(userId, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);

  return NextResponse.json({ token: session.token, userId });
}
