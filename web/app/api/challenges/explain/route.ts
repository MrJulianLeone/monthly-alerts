import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { addChatMessage } from "@/lib/coach";
import { coachMessage } from "@/lib/ai";
import { trackEvent } from "@/lib/geo";

export const maxDuration = 30;

/**
 * "Explain this exercise": the coach posts a short how-to for the user's
 * active challenge into the chat (proper form, what to focus on, common
 * mistakes). Falls back to the catalog description if the AI is unavailable.
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const rows = (await sql()`
    SELECT c.id, c.target_value, e.name, e.unit, e.description, e.equipment
    FROM challenges c JOIN exercises e ON e.id = c.exercise_id
    WHERE c.user_id = ${auth.user.id} AND c.status = 'active'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as {
    id: string;
    target_value: number;
    name: string;
    unit: string;
    description: string | null;
    equipment: string;
  }[];
  const active = rows[0];
  if (!active) return jsonError("No active challenge", 404);

  const unitLabel = active.unit === "seconds" ? "seconds" : "reps";
  let explanation = "";
  try {
    explanation = await coachMessage(
      `Explain how to do the exercise "${active.name}" (${active.equipment}, target ${active.target_value} ${unitLabel}). ` +
        `Cover proper form step by step, one common mistake to avoid, and one safety tip. ` +
        `4-5 short sentences, plain text.${active.description ? ` Reference description: ${active.description}` : ""}`
    );
  } catch {
    // AI unavailable — the catalog description still answers the question.
  }
  if (!explanation) {
    explanation = active.description
      ? `${active.name}: ${active.description} Aim for ${active.target_value} ${unitLabel}, focus on controlled form over speed.`
      : `${active.name}: aim for ${active.target_value} ${unitLabel}. Move with control, keep breathing steady, and stop if anything hurts.`;
  }

  await addChatMessage(auth.user.id, "coach", "text", explanation, {
    challenge_id: active.id,
  });
  await trackEvent(request, "challenge_explained", auth.user.id);

  return NextResponse.json({ explanation });
}
