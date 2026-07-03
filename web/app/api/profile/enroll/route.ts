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

  const body = await request.json().catch(() => ({}));

  // Name and birthday were collected at onboarding — reuse them by default.
  const stored = (await sql()`
    SELECT name, date_of_birth FROM users WHERE id = ${auth.user.id}
  `) as { name: string | null; date_of_birth: string | Date | null }[];
  const displayName =
    (typeof body?.displayName === "string" && body.displayName.trim()) || stored[0]?.name;
  const storedDob = stored[0]?.date_of_birth
    ? new Date(stored[0].date_of_birth).toISOString().slice(0, 10)
    : null;
  const dateOfBirth = body?.dateOfBirth || storedDob;

  if (!displayName) return jsonError("Display name is required");
  if (!dateOfBirth || isNaN(Date.parse(dateOfBirth))) {
    return jsonError("Date of birth is required");
  }
  const age = ageFromDob(dateOfBirth);
  if (age < 16) return jsonError("Self-enrollment requires being 16 or older", 403);
  if (age > 120) return jsonError("Please check the date of birth");

  await enrollExistingUser(auth.user.id, {
    displayName: String(displayName).slice(0, 60),
    dateOfBirth,
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
