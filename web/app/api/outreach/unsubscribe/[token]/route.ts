import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { suppress, type Prospect } from "@/lib/prospecting";

export const dynamic = "force-dynamic";

/**
 * RFC 8058 one-click unsubscribe target (List-Unsubscribe-Post). Mailbox
 * providers POST here when the recipient taps their native "Unsubscribe"
 * button. No auth, idempotent, always 200 so the provider stops retrying.
 */
export async function POST(_request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  try {
    const rows = (await sql()`
      SELECT * FROM prospects WHERE visit_token = ${token}
    `) as Prospect[];
    const prospect = rows[0];
    if (prospect) {
      if (prospect.email) await suppress(prospect.email, "unsubscribe");
      await sql()`
        UPDATE prospects
        SET status = 'suppressed', status_note = 'Unsubscribed (one-click)', updated_at = now()
        WHERE id = ${prospect.id}
      `;
    }
  } catch (err) {
    console.error("one-click unsubscribe failed:", err);
  }
  return NextResponse.json({ ok: true });
}

/** Some providers probe with GET first. */
export async function GET(request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  return NextResponse.redirect(new URL(`/w/${token}/u`, request.url), 302);
}
