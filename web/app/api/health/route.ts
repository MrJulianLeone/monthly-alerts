import { NextResponse } from "next/server";
import { billingEnabled } from "@/lib/billing";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql()`SELECT 1`;
    return NextResponse.json({
      ok: true,
      billing: billingEnabled(),
      billing_flag: process.env.BILLING_ENABLED === "true",
      has_stripe_key: !!process.env.STRIPE_SECRET_KEY,
      has_price_id: !!process.env.STRIPE_PRICE_ID,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
