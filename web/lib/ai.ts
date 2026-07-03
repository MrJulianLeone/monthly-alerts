import OpenAI from "openai";
import { kgToLb } from "@/lib/units";

let client: OpenAI | null = null;

function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const COACH_SYSTEM = `You are the MonthlyAlerts Coach: a professional, encouraging personal
health coach for users aged 11 and up. Tone: serious, warm, concise. No emojis, no slang,
no medical claims, no calorie counting for minors. Always be constructive and specific.`;

export type MealAnalysis = {
  feedback: string;
  balance: "balanced" | "needs_protein" | "needs_vegetables" | "heavy" | "light" | "unclear";
  items: string[];
};

/** GPT-4o vision analysis of a meal photo: short, useful, balance-focused. */
export async function analyzeMealPhoto(
  photoUrl: string,
  context: { age: number; goal: string | null }
): Promise<MealAnalysis> {
  const response = await openai().chat.completions.create({
    model: "gpt-4o",
    max_tokens: 300,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: COACH_SYSTEM },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this meal photo for a ${context.age}-year-old whose goal is "${
              context.goal ?? "general fitness"
            }". Respond as JSON: {"feedback": "2-3 sentence practical coaching feedback focused on balance and avoiding over/under-eating", "balance": one of "balanced"|"needs_protein"|"needs_vegetables"|"heavy"|"light"|"unclear", "items": ["visible food items"]}. If the photo is not food, say so politely in feedback and use balance "unclear".`,
          },
          { type: "image_url", image_url: { url: photoUrl, detail: "low" } },
        ],
      },
    ],
  });
  try {
    const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
    return {
      feedback:
        typeof parsed.feedback === "string" && parsed.feedback.length > 0
          ? parsed.feedback
          : "Meal logged. Keep aiming for a balanced plate with protein and vegetables.",
      balance: [
        "balanced",
        "needs_protein",
        "needs_vegetables",
        "heavy",
        "light",
        "unclear",
      ].includes(parsed.balance)
        ? parsed.balance
        : "unclear",
      items: Array.isArray(parsed.items) ? parsed.items.slice(0, 10) : [],
    };
  } catch {
    return {
      feedback:
        "Meal logged. Keep aiming for a balanced plate with protein and vegetables.",
      balance: "unclear",
      items: [],
    };
  }
}

/** GPT-4o-mini short coach message (challenge intros, encouragement). */
export async function coachMessage(prompt: string): Promise<string> {
  const response = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 150,
    messages: [
      { role: "system", content: COACH_SYSTEM },
      { role: "user", content: prompt },
    ],
  });
  return response.choices[0].message.content?.trim() ?? "";
}

export type MonthlyStats = {
  month: string;
  meals_logged: number;
  challenges_completed: number;
  best_streak: number;
  current_streak: number;
  active_days: number;
  weight_start_kg: number | null;
  weight_end_kg: number | null;
  weight_delta_kg: number | null;
  prev_meals_logged: number | null;
  prev_challenges_completed: number | null;
};

/** GPT-4o-mini narrative for the monthly progress summary. */
export async function monthlyNarrative(
  displayName: string,
  stats: MonthlyStats
): Promise<string> {
  // Users see imperial units; convert the metric stats before prompting.
  const displayStats = {
    ...stats,
    weight_start_lb: stats.weight_start_kg !== null ? kgToLb(stats.weight_start_kg) : null,
    weight_end_lb: stats.weight_end_kg !== null ? kgToLb(stats.weight_end_kg) : null,
    weight_delta_lb: stats.weight_delta_kg !== null ? kgToLb(stats.weight_delta_kg) : null,
    weight_start_kg: undefined,
    weight_end_kg: undefined,
    weight_delta_kg: undefined,
  };
  const response = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 400,
    messages: [
      { role: "system", content: COACH_SYSTEM },
      {
        role: "user",
        content: `Write a monthly progress summary (3 short paragraphs, plain text) for ${displayName}. Data: ${JSON.stringify(
          displayStats
        )}. Cover: what they accomplished (meals logged, challenges completed, streaks), the trend versus last month if available, weight change only if provided (report weight in pounds), and one specific focus for next month. Professional and encouraging; no headings, no lists.`,
      },
    ],
  });
  return response.choices[0].message.content?.trim() ?? "";
}
