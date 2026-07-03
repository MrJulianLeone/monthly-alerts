import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";

/** My subscription status (drives paywall state in the app). */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const rows = (await sql()`
    SELECT status, trial_ends_at, current_period_end, canceled_at
    FROM subscriptions WHERE user_id = ${auth.user.id}
  `) as {
    status: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    canceled_at: string | null;
  }[];

  const sub = rows[0] ?? null;
  const trialActive = sub?.trial_ends_at ? new Date(sub.trial_ends_at) > new Date() : false;

  return NextResponse.json({
    subscription: sub,
    access: sub?.status === "active" || trialActive,
    trialActive,
  });
}
