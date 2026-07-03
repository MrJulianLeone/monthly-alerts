import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { analyzeMealPhoto } from "@/lib/ai";
import { addChatMessage, updateMealStreak } from "@/lib/coach";
import { recordMealProgress } from "@/lib/progress";
import { ageFromDob } from "@/lib/auth";
import { trackEvent } from "@/lib/geo";

export const maxDuration = 60;

/**
 * "Snap Meal": multipart upload with a `photo` file (and optional `mealType`).
 *
 * The image is sent to the vision model inline (never uploaded or stored) and
 * discarded as soon as categorization returns. Only the structured result
 * (feedback, balance, items) is persisted, the streak and running progress are
 * updated, and both sides of the chat exchange are posted.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const form = await request.formData().catch(() => null);
  const photo = form?.get("photo");
  if (!photo || !(photo instanceof File)) return jsonError("A photo file is required");
  if (photo.size > 10 * 1024 * 1024) return jsonError("Photo must be under 10 MB");
  const mealType = form?.get("mealType");

  // Send the image to the model inline as a base64 data URL. Nothing is
  // uploaded and no bytes are retained after this request returns.
  const bytes = Buffer.from(await photo.arrayBuffer());
  const mime = photo.type || "image/jpeg";
  const imageDataUrl = `data:${mime};base64,${bytes.toString("base64")}`;

  const profileRows = (await sql()`
    SELECT goal FROM profiles WHERE user_id = ${auth.user.id}
  `) as { goal: string | null }[];

  const analysis = await analyzeMealPhoto(imageDataUrl, {
    age: auth.user.date_of_birth ? ageFromDob(auth.user.date_of_birth) : 25,
    goal: profileRows[0]?.goal ?? null,
  });

  const mealRows = (await sql()`
    INSERT INTO meal_logs (user_id, meal_type, ai_feedback, ai_analysis, ai_model)
    VALUES (${auth.user.id},
            ${typeof mealType === "string" && mealType ? mealType : null},
            ${analysis.feedback}, ${JSON.stringify(analysis)}, 'gpt-4o')
    RETURNING id
  `) as { id: string }[];
  const mealId = mealRows[0].id;

  const streak = await updateMealStreak(auth.user.id);
  await recordMealProgress(auth.user.id, analysis.balance);

  // No image is stored; the meal bubble is rendered from the categorization.
  await addChatMessage(auth.user.id, "user", "meal_photo", null, {
    meal_log_id: mealId,
    balance: analysis.balance,
    items: analysis.items.slice(0, 6),
  });
  const feedbackWithStreak =
    streak >= 2 ? `${analysis.feedback} You're on a ${streak}-day logging streak — keep it up.` : analysis.feedback;
  await addChatMessage(auth.user.id, "coach", "text", feedbackWithStreak, {
    meal_log_id: mealId,
  });

  await trackEvent(request, "meal_logged", auth.user.id);

  return NextResponse.json(
    { mealId, feedback: feedbackWithStreak, analysis, streak },
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
    SELECT id, meal_type, ai_feedback, ai_analysis, logged_at
    FROM meal_logs WHERE user_id = ${auth.user.id}
    ORDER BY logged_at DESC LIMIT ${limit}
  `) as Record<string, unknown>[];

  return NextResponse.json({ meals });
}
