import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ageFromDob } from "@/lib/auth";
import { requireUser, jsonError } from "@/lib/api";
import { enrollExistingUser } from "@/lib/onboarding";
import { trackEvent } from "@/lib/geo";

/**
 * Lets an existing account without a coaching profile (typically a parent)
 * enroll as a coached user themselves. They keep their role, so parents
 * retain the parent dashboard while getting the full app experience.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const existing = (await sql()`
    SELECT 1 FROM profiles WHERE user_id = ${auth.user.id}
  `) as unknown[];
  if (existing.length > 0) {
    return jsonError("This account already has a coaching profile", 409);
  }

  const body = await request.json().catch(() => null);
  if (!body?.displayName || typeof body.displayName !== "string") {
    return jsonError("Display name is required");
  }
  if (!body?.dateOfBirth || isNaN(Date.parse(body.dateOfBirth))) {
    return jsonError("Date of birth is required");
  }
  const age = ageFromDob(body.dateOfBirth);
  if (age < 16) return jsonError("Self-enrollment requires being 16 or older", 403);
  if (age > 120) return jsonError("Please check the date of birth");

  await enrollExistingUser(auth.user.id, {
    displayName: body.displayName.trim().slice(0, 60),
    dateOfBirth: body.dateOfBirth,
    gender: ["male", "female", "other"].includes(body.gender) ? body.gender : null,
    heightCm:
      typeof body.heightCm === "number" && body.heightCm > 80 && body.heightCm < 260
        ? body.heightCm
        : null,
    weightKg:
      typeof body.weightKg === "number" && body.weightKg > 20 && body.weightKg < 400
        ? body.weightKg
        : null,
    goal: ["lose_weight", "build_strength", "get_fit", "build_habits"].includes(body.goal)
      ? body.goal
      : null,
    timezone: typeof body.timezone === "string" ? body.timezone : "UTC",
  });

  await trackEvent(request, "self_enrolled", auth.user.id);

  return NextResponse.json({ ok: true }, { status: 201 });
}
