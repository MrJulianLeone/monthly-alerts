import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { runPipeline } from "@/lib/prospect-pipeline";

export const maxDuration = 300;

/** Runs the daily pipeline on demand (same code as the cron). Admin-only. */
export async function POST() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const summary = await runPipeline();
  return NextResponse.json(summary);
}
