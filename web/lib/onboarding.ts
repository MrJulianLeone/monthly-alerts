import { sql } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";
import { addChatMessage } from "@/lib/coach";
import { unlockNextChallenge } from "@/lib/progression";

const TRIAL_DAYS = 30;

export type EnrollProfile = {
  displayName: string;
  dateOfBirth: string;
  gender?: "male" | "female" | "other" | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: "lose_weight" | "build_strength" | "get_fit" | "build_habits" | null;
  timezone?: string;
};

/**
 * Provisions coaching for an EXISTING account that has no profile yet —
 * used by parents who want to use the app individually (they keep their
 * parent role and dashboard). Creates profile, trial, streak, welcome
 * messages, and the first challenge.
 */
export async function enrollExistingUser(
  userId: string,
  input: EnrollProfile
): Promise<void> {
  const db = sql();

  await db`
    UPDATE users SET date_of_birth = ${input.dateOfBirth} WHERE id = ${userId}
  `;

  await db`
    INSERT INTO profiles (user_id, display_name, gender, height_cm, weight_kg, goal,
                          timezone, onboarding_completed_at)
    VALUES (${userId}, ${input.displayName}, ${input.gender ?? null},
            ${input.heightCm ?? null}, ${input.weightKg ?? null},
            ${input.goal ?? null}, ${input.timezone ?? "UTC"}, now())
  `;

  if (input.weightKg) {
    await db`
      INSERT INTO weight_entries (user_id, weight_kg) VALUES (${userId}, ${input.weightKg})
    `;
  }

  const trialEnds = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  await db`
    INSERT INTO subscriptions (user_id, status, trial_ends_at)
    VALUES (${userId}, 'trialing', ${trialEnds.toISOString()})
    ON CONFLICT (user_id) DO NOTHING
  `;

  await db`
    INSERT INTO streaks (user_id) VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `;

  await addChatMessage(
    userId,
    "coach",
    "text",
    `Welcome to MonthlyAlerts, ${input.displayName}. I'm your coach. Each day, snap a photo of your meals and complete your challenge — I'll guide you and track your progress. At the end of every month you'll get a full progress summary.`
  );

  const challenge = await unlockNextChallenge(userId);
  if (challenge) {
    await addChatMessage(
      userId,
      "coach",
      "challenge_prompt",
      `Your first challenge: ${challenge.exercise.name} — ${challenge.target} ${
        challenge.exercise.unit === "seconds" ? "seconds" : "reps"
      }. Tap "I Did It" when you finish.`,
      { challenge_id: challenge.id }
    );
  }
}

export type NewCoachedUser = {
  email: string;
  password?: string;
  authProvider?: "email" | "apple" | "google";
  appleSub?: string;
  googleSub?: string;
  parentId?: string;
  displayName: string;
  dateOfBirth: string; // YYYY-MM-DD, required for all coached users
  gender?: "male" | "female" | "other" | null;
  heightCm?: number | null;
  weightKg?: number | null;
  goal?: "lose_weight" | "build_strength" | "get_fit" | "build_habits" | null;
  timezone?: string;
};

/**
 * Provisions a coached user end-to-end: account, profile, 30-day free trial,
 * streak row, first challenge, and the coach's welcome messages. Returns the
 * new user id. Used by self-signup (16+) and parent-managed setup (<16).
 */
export async function createCoachedUser(input: NewCoachedUser): Promise<string> {
  const db = sql();

  // The single hardcoded admin email is the only account that ever gets the
  // admin role — there is no other promotion path.
  const role = isAdminEmail(input.email) ? "admin" : "user";

  const userRows = (await db`
    INSERT INTO users (email, password_hash, auth_provider, apple_sub, google_sub,
                       role, parent_id, date_of_birth, email_verified_at, last_active_at)
    VALUES (
      ${input.email},
      ${input.password ? hashPassword(input.password) : null},
      ${input.authProvider ?? "email"},
      ${input.appleSub ?? null},
      ${input.googleSub ?? null},
      ${role},
      ${input.parentId ?? null},
      ${input.dateOfBirth},
      ${input.authProvider && input.authProvider !== "email" ? new Date().toISOString() : null},
      now()
    )
    RETURNING id
  `) as { id: string }[];
  const userId = userRows[0].id;

  await db`
    INSERT INTO profiles (user_id, display_name, gender, height_cm, weight_kg, goal,
                          timezone, onboarding_completed_at)
    VALUES (${userId}, ${input.displayName}, ${input.gender ?? null},
            ${input.heightCm ?? null}, ${input.weightKg ?? null},
            ${input.goal ?? null}, ${input.timezone ?? "UTC"}, now())
  `;

  if (input.weightKg) {
    await db`
      INSERT INTO weight_entries (user_id, weight_kg) VALUES (${userId}, ${input.weightKg})
    `;
  }

  const trialEnds = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  await db`
    INSERT INTO subscriptions (user_id, status, trial_ends_at)
    VALUES (${userId}, 'trialing', ${trialEnds.toISOString()})
  `;

  await db`INSERT INTO streaks (user_id) VALUES (${userId})`;

  await addChatMessage(
    userId,
    "coach",
    "text",
    `Welcome to MonthlyAlerts, ${input.displayName}. I'm your coach. Each day, snap a photo of your meals and complete your challenge — I'll guide you and track your progress. At the end of every month you'll get a full progress summary.`
  );

  const challenge = await unlockNextChallenge(userId);
  if (challenge) {
    await addChatMessage(
      userId,
      "coach",
      "challenge_prompt",
      `Your first challenge: ${challenge.exercise.name} — ${challenge.target} ${
        challenge.exercise.unit === "seconds" ? "seconds" : "reps"
      }. Tap "I Did It" when you finish.`,
      { challenge_id: challenge.id }
    );
  }

  return userId;
}
