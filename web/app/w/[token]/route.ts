import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { appUrl } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Per-prospect attribution link used in outreach emails: logs the visit and
 * redirects to the homepage. Unknown tokens still redirect (never a dead
 * link in someone's inbox). Obvious mail-scanner bots are not logged.
 */
export async function GET(request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const dest = `${appUrl()}/?utm_source=outreach&utm_medium=email`;
  const ua = request.headers.get("user-agent") ?? "";

  try {
    if (token && !/bot|crawl|spider|preview|scan|proofpoint|safelinks/i.test(ua)) {
      await sql()`
        INSERT INTO prospect_visits (prospect_id, user_agent)
        SELECT id, ${ua.slice(0, 300)} FROM prospects WHERE visit_token = ${token}
      `;
    }
  } catch (err) {
    console.error("prospect visit logging failed:", err);
  }
  return NextResponse.redirect(dest, 302);
}
