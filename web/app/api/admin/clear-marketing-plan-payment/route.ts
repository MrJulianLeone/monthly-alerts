import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

/**
 * One-time fixup endpoint: the seeded "MonthlyAlerts Marketing Plan" project
 * was activated with paid_at set, which the admin dashboard counts as a $100
 * payment that never happened. Clears its payment fields so it shows as
 * free. Idempotent, token-protected, removed after use.
 */
const TOKEN = "ee5f2495a5079c87e3a9afd7828a08fe6779416ce81d3f3c1e143b21824302b7";
const PROJECT_ID = "5591ff05-c902-4bf3-9a3e-9df1069b4b82";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${TOKEN}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const q = sql();

  const before = (await q`
    SELECT p.id, p.name, o.email AS owner_email, p.paid_at
    FROM projects p JOIN users o ON o.id = p.owner_id
    WHERE p.id = ${PROJECT_ID} OR p.name LIKE '%Marketing Plan%'
  `) as Record<string, unknown>[];

  const updated = (await q`
    UPDATE projects
    SET paid_at = NULL, stripe_session_id = NULL, amount_paid_cents = NULL
    WHERE id = ${PROJECT_ID}
    RETURNING id, paid_at, stripe_session_id, amount_paid_cents
  `) as Record<string, unknown>[];

  return NextResponse.json({ ok: true, before, updated });
}
