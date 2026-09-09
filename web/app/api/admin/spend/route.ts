import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { sql } from "@/lib/db";
import { SPEND_CHANNELS } from "@/lib/kpis";

/** Admin: record (upsert) one month's spend for a channel, in whole dollars. */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));
  const month = typeof body.month === "string" && /^\d{4}-\d{2}$/.test(body.month) ? `${body.month}-01` : null;
  const channel = (SPEND_CHANNELS as readonly string[]).includes(body.channel) ? (body.channel as string) : null;
  const dollars = Number(body.amount);
  if (!month || !channel || !Number.isFinite(dollars) || dollars < 0) {
    return jsonError("month (YYYY-MM), channel, and amount are required", 400);
  }
  await sql()`
    INSERT INTO marketing_spend (month, channel, amount_cents)
    VALUES (${month}::date, ${channel}, ${Math.round(dollars * 100)})
    ON CONFLICT (month, channel) DO UPDATE SET amount_cents = EXCLUDED.amount_cents, updated_at = now()
  `;
  return NextResponse.json({ ok: true });
}
