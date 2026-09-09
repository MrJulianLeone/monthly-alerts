import { NextResponse } from "next/server";
import { ATTRIBUTION_DAYS, REF_COOKIE } from "@/lib/attribution";
import { appUrl } from "@/lib/email";
import { findReferralCode } from "@/lib/referrals";

export const dynamic = "force-dynamic";

/**
 * Referral landing: /r/CODE (also reached from the vanity /CODE) sets the
 * referral cookie and lands on the home page tagged as a referral visit.
 * Unknown codes just go home.
 */
export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const found = await findReferralCode(code).catch(() => null);
  if (!found) return NextResponse.redirect(`${appUrl()}/`, 302);

  const res = NextResponse.redirect(
    `${appUrl()}/?utm_source=referral&utm_medium=link&utm_campaign=${encodeURIComponent(found.code)}`,
    302
  );
  res.cookies.set(REF_COOKIE, found.code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ATTRIBUTION_DAYS * 86_400,
  });
  return res;
}
