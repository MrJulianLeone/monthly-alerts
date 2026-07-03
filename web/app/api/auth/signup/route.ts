import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ageFromDob, createSession, hashToken, setSessionCookie, setUserCookie } from "@/lib/auth";
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

  const { email, password, firstName, lastName, dateOfBirth, gender, heightCm, weightKg, goal, timezone } = body;

  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return jsonError("A valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return jsonError("Password must be at least 8 characters");
  }
  // Names arrive as separate first/last fields; older clients may still send
  // a single displayName. Either way, profiles store one display_name.
  const displayName =
    typeof firstName === "string" && firstName.trim()
      ? [firstName.trim(), typeof lastName === "string" ? lastName.trim() : ""]
          .filter(Boolean)
          .join(" ")
          .slice(0, 60)
      : typeof body.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim().slice(0, 60)
        : null;
  if (!displayName) {
    return jsonError("First and last name are required");
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

  // Signed up through a family invite link — mark the invitation accepted.
  if (typeof body.familyToken === "string" && body.familyToken) {
    await sql()`
      UPDATE family_invites SET status = 'accepted', accepted_at = now()
      WHERE token_hash = ${hashToken(body.familyToken)} AND status = 'pending'
    `.catch(() => {});
  }

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
