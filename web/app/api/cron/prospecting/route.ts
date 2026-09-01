import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/api";
import { runPipeline } from "@/lib/prospect-pipeline";

export const maxDuration = 300;

/**
 * Daily prospecting run (vercel.json). Polls the outreach inbox for replies
 * and bounces, marks conversions, then advances batches through enrichment,
 * scoring, drafting, and sending (approved emails + due follow-ups, under
 * the warm-up-aware daily cap). Every stage is idempotent.
 */
export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;
  const summary = await runPipeline();
  console.log("prospecting cron:", JSON.stringify(summary));
  return NextResponse.json(summary);
}
