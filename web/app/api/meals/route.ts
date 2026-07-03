import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { analyzeMealPhoto } from "@/lib/ai";
import { addChatMessage, updateMealStreak } from "@/lib/coach";
import { ageFromDob } from "@/lib/auth";
import { trackEvent } from "@/lib/geo";

export const maxDuration = 60;

/**
 * "Snap Meal": multipart upload with a `photo` file (and optional `mealType`).
 * Stores the photo in Vercel Blob, runs GPT-4o vision analysis, logs the meal,
 * updates the streak, and posts both sides of the chat exchange.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (!photo || !(photo instanceof File)) return jsonError("A photo file is required");
  if (photo.size > 10 * 1024 * 1024) return jsonError("Photo must be under 10 MB");
  const mealType = form?.get("mealType");

  const blob = await put(
    `meals/${auth.user.id}/${Date.now()}.jpg`,
    photo,
    { access: "public", contentType: photo.type || "image/jpeg" }
  );

  const profileRows = (await sql()`
    SELECT goal FROM profiles WHERE user_id = ${auth.user.id}
  `) as { goal: string | null }[];

  const analysis = await analyzeMealPhoto(blob.url, {
    age: auth.user.date_of_birth ? ageFromDob(auth.user.date_of_birth) : 25,
    goal: profileRows[0]?.goal ?? null,
  });

  const mealRows = (await sql()`
    INSERT INTO meal_logs (user_id, photo_url, meal_type, ai_feedback, ai_analysis, ai_model)
    VALUES (${auth.user.id}, ${blob.url},
            ${typeof mealType === "string" && mealType ? mealType : null},
            ${analysis.feedback}, ${JSON.stringify(analysis)}, 'gpt-4o')
    RETURNING id
  `) as { id: string }[];
  const mealId = mealRows[0].id;

  const streak = await updateMealStreak(auth.user.id);

  await addChatMessage(auth.user.id, "user", "meal_photo", null, {
    meal_log_id: mealId,
    photo_url: blob.url,
  });
  const feedbackWithStreak =
    streak >= 2 ? `${analysis.feedback} You're on a ${streak}-day logging streak — keep it up.` : analysis.feedback;
  await addChatMessage(auth.user.id, "coach", "text", feedbackWithStreak, {
    meal_log_id: mealId,
  });

  await trackEvent(request, "meal_logged", auth.user.id);

  return NextResponse.json(
    { mealId, photoUrl: blob.url, feedback: feedbackWithStreak, analysis, streak },
    { status: 201 }
  );
}

/** Meal history (used by the History tab and parent dashboard). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10) || 30, 100);

  const meals = (await sql()`
    SELECT id, photo_url, meal_type, ai_feedback, logged_at
    FROM meal_logs WHERE user_id = ${auth.user.id}
    ORDER BY logged_at DESC LIMIT ${limit}
  `) as Record<string, unknown>[];

  return NextResponse.json({ meals });
}
