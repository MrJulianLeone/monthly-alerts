import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { sql } from "@/lib/db";
import { PROJECT_PRICE_CENTS } from "@/lib/pricing";
import { grantCredit } from "@/lib/referrals";

/**
 * Admin: comp a project ("try your next project on us") by granting credit
 * to an account by email. Defaults to one full project fee.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const amount =
    Number.isInteger(body.amount_cents) && body.amount_cents !== 0
      ? (body.amount_cents as number)
      : PROJECT_PRICE_CENTS;
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : null;
  if (!email) return jsonError("Email is required", 400);

  const users = (await sql()`
    SELECT id FROM users WHERE email = ${email} AND deleted_at IS NULL
  `) as { id: string }[];
  if (users.length === 0) return jsonError("No account with that email", 404);

  await grantCredit({
    userId: users[0].id,
    amountCents: amount,
    reason: "comp",
    note: note || "Comped by admin",
    createdBy: auth.user.id,
  });
  return NextResponse.json({ ok: true });
}
