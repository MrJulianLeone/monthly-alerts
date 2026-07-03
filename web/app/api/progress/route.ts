import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api";
import { getProgress } from "@/lib/progress";

/**
 * Running progress summary: a cumulative, storage-efficient snapshot of the
 * user's diet + fitness progress (meals logged, distinct logging days, balanced
 * meals, challenges completed, cumulative volume). Backs on-demand progress
 * views between the monthly summaries.
 */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const progress = await getProgress(auth.user.id);
  return NextResponse.json({ progress });
}
