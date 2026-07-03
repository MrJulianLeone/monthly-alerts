import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireRole, jsonError } from "@/lib/api";
import { generateMonthlySummary, previousMonthStart } from "@/lib/summaries";

export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

/** On-demand monthly summary for a child (generates last month's if needed). */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireRole(request, "parent");
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const child = (await sql()`
    SELECT 1 FROM users WHERE id = ${id} AND parent_id = ${auth.user.id} AND deleted_at IS NULL
  `) as unknown[];
  if (child.length === 0) return jsonError("Child not found", 404);

  const body = await request.json().catch(() => ({}));
  // Optional "month": "YYYY-MM"; defaults to the previous calendar month.
  const monthStart = /^\d{4}-\d{2}$/.test(body.month ?? "")
    ? new Date(`${body.month}-01T00:00:00Z`)
    : previousMonthStart();

  // Force a fresh email even if the summary already exists.
  await sql()`
    DELETE FROM monthly_summaries
    WHERE user_id = ${id} AND month = ${monthStart.toISOString().slice(0, 10)}
      AND email_sent_at IS NULL
  `;

  const summaryId = await generateMonthlySummary(id, monthStart);
  if (!summaryId) return jsonError("Could not generate a summary for this child", 500);

  return NextResponse.json({ ok: true, summaryId });
}
