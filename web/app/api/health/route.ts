import { NextResponse } from "next/server";
import { billingEnabled } from "@/lib/billing";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    await sql()`SELECT 1`;
    return NextResponse.json({ ok: true, billing: billingEnabled() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
