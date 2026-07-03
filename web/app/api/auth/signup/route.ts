import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ageFromDob, createSession, setSessionCookie, setUserCookie } from "@/lib/auth";
import { createCoachedUser } from "@/lib/onboarding";
import { jsonError } from "@/lib/api";
import { trackEvent } from "@/lib/geo";

/**
 * Self-signup for users 16+. Onboarding starts by collecting name and date of
 * birth; under-16 users are routed to POST /api/onboarding/parent-invite instead.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid request body");

  const { email, password, displayName, dateOfBirth, gender, heightCm, weightKg, goal, timezone } = body;

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return jsonError("A valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return jsonError("Password must be at least 8 characters");
  }
  if (!displayName || typeof displayName !== "string") {
    return jsonError("Display name is required");
  }
  if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
    return jsonError("Date of birth is required");
  }
  const age = ageFromDob(dateOfBirth);
  if (age < 16) {
    return jsonError(
      "Users under 16 need a parent to set up their account. Please restart onboarding.",
      403
    );
  }
  if (age > 120) return jsonError("Please check the date of birth");

  const existing = (await sql()`
    SELECT id FROM users WHERE email = ${email}
  `) as { id: string }[];
  if (existing.length > 0) return jsonError("An account with this email already exists", 409);

  const userId = await createCoachedUser({
    email,
    password,
    displayName,
    dateOfBirth,
    gender: gender ?? null,
    heightCm: heightCm ?? null,
    weightKg: weightKg ?? null,
    goal: goal ?? null,
    timezone: timezone ?? "UTC",
  });

  const session = await createSession(userId, {
    userAgent: request.headers.get("user-agent"),
  });
  await setSessionCookie(session.token, session.expiresAt);
  const roleRows = (await sql()`
    SELECT role FROM users WHERE id = ${userId}
  `) as { role: string }[];
  await setUserCookie(displayName, roleRows[0]?.role ?? "user");
  await trackEvent(request, "signup", userId);

  return NextResponse.json({ token: session.token, userId }, { status: 201 });
}
