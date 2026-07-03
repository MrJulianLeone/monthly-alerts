import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";
import { addChatMessage } from "@/lib/coach";
import { unlockNextChallenge } from "@/lib/progression";
import { trackEvent } from "@/lib/geo";

/**
 * "Pass": skips the active challenge and immediately unlocks a different one
 * (the progression engine rotates to the next exercise in the catalog).
 * Body: { challengeId? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));

  const rows = (await sql()`
    SELECT c.id, e.name
    FROM challenges c JOIN exercises e ON e.id = c.exercise_id
    WHERE c.user_id = ${auth.user.id} AND c.status = 'active'
    ORDER BY c.sequence_number DESC LIMIT 1
  `) as { id: string; name: string }[];
  const active = rows[0];
  if (!active) return jsonError("No active challenge", 404);
  if (body.challengeId && body.challengeId !== active.id) {
    return jsonError("This challenge is no longer active", 409);
  }

  await sql()`
    UPDATE challenges SET status = 'skipped' WHERE id = ${active.id}
  `;

  await addChatMessage(auth.user.id, "user", "text", `Pass on the ${active.name} for now.`, {
    challenge_id: active.id,
    skipped: true,
  });

  const next = await unlockNextChallenge(auth.user.id);
  if (next) {
    const unitLabel = next.exercise.unit === "seconds" ? "seconds" : "reps";
    await addChatMessage(
      auth.user.id,
      "coach",
      "challenge_prompt",
      `No problem — everyone has off days. Try this instead: ${next.exercise.name} — ${next.target} ${unitLabel}. Mark it complete from the Challenge menu when you finish.`,
      { challenge_id: next.id }
    );
  }

  await trackEvent(request, "challenge_skipped", auth.user.id);

  return NextResponse.json({
    skipped: { id: active.id },
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
