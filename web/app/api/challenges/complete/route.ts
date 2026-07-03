import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { addChatMessage } from "@/lib/coach";
import { recordChallengeProgress } from "@/lib/progress";
import { unlockNextChallenge } from "@/lib/progression";
import { trackEvent } from "@/lib/geo";

/**
 * "I Did It": completes the active challenge and immediately unlocks the next
 * one (sequential progression).
 * Body: { challengeId, completedValue?, difficulty?: "easy"|"right"|"hard" }
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));

  const rows = (await sql()`
    SELECT c.id, c.target_value, e.name, e.unit
    FROM challenges c JOIN exercises e ON e.id = c.exercise_id
    WHERE c.user_id = ${auth.user.id} AND c.status = 'active'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as { id: string; target_value: number; name: string; unit: string }[];
  const active = rows[0];
  if (!active) return jsonError("No active challenge", 404);
  if (body.challengeId && body.challengeId !== active.id) {
    return jsonError("This challenge is no longer active", 409);
  }

  const completedValue =
    typeof body.completedValue === "number" && body.completedValue > 0
      ? Math.round(body.completedValue)
      : active.target_value;
  const difficulty = ["easy", "right", "hard"].includes(body.difficulty)
    ? body.difficulty
    : null;

  await sql()`
    UPDATE challenges SET status = 'completed', completed_at = now()
    WHERE id = ${active.id}
  `;
  await sql()`
    INSERT INTO challenge_logs (challenge_id, user_id, completed_value, perceived_difficulty)
    VALUES (${active.id}, ${auth.user.id}, ${completedValue}, ${difficulty})
  `;
  await recordChallengeProgress(auth.user.id, completedValue);

  await addChatMessage(auth.user.id, "user", "challenge_complete", null, {
    challenge_id: active.id,
    completed_value: completedValue,
  });

  const next = await unlockNextChallenge(auth.user.id);
  if (next) {
    const unitLabel = next.exercise.unit === "seconds" ? "seconds" : "reps";
    await addChatMessage(
      auth.user.id,
      "coach",
      "challenge_prompt",
      `Well done on the ${active.name}. Next up: ${next.exercise.name} — ${next.target} ${unitLabel}. Take it when you're ready.`,
      { challenge_id: next.id }
    );
  }

  await trackEvent(request, "challenge_completed", auth.user.id);

  return NextResponse.json({
    completed: { id: active.id, completedValue },
    next: next
      ? {
          id: next.id,
          name: next.exercise.name,
          target_value: next.target,
          unit: next.exercise.unit,
          sequence_number: next.sequence,
        }
      : null,
  });
}
