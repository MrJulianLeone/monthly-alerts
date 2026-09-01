import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/prospecting";

/** Updates the prospecting settings singleton (partial). Admin-only. */
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const current = await getSettings();

  const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };

  const paused = typeof body.paused === "boolean" ? body.paused : current.paused;
  const dailyCap = clampInt(body.daily_cap, 1, 200, current.daily_cap);
  const threshold = clampInt(body.score_threshold, 0, 10, current.score_threshold);
  const followupDays = clampInt(body.followup_days, 2, 30, current.followup_days);
  const snoozeMonths = clampInt(body.snooze_months, 1, 24, current.snooze_months);
  const targetNotes =
    typeof body.target_notes === "string"
      ? body.target_notes.slice(0, 4000) || null
      : current.target_notes;

  await sql()`
    UPDATE prospecting_settings
    SET paused = ${paused}, daily_cap = ${dailyCap}, score_threshold = ${threshold},
        followup_days = ${followupDays}, snooze_months = ${snoozeMonths},
        target_notes = ${targetNotes}
    WHERE id
  `;
  return NextResponse.json({ ok: true, settings: await getSettings() });
}
