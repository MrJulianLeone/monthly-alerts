import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * One-time fixup endpoint: the seeded "MonthlyAlerts Marketing Plan" project
 * was activated with paid_at set, which the admin dashboard counts as a $100
 * payment that never happened. Clears its payment fields so it shows as
 * free. Idempotent, token-protected, removed after use.
 */
const TOKEN = "ee5f2495a5079c87e3a9afd7828a08fe6779416ce81d3f3c1e143b21824302b7";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = (await sql()`
    UPDATE projects p
    SET paid_at = NULL, stripe_session_id = NULL, amount_paid_cents = NULL
    FROM users o
    WHERE o.id = p.owner_id
      AND o.email = 'julianleone@gmail.com'
      AND p.name = 'MonthlyAlerts Marketing Plan'
    RETURNING p.id, p.paid_at, p.stripe_session_id, p.amount_paid_cents
  `) as { id: string }[];

  return NextResponse.json({ ok: true, updated: rows });
}
