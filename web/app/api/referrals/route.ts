import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { appUrl } from "@/lib/email";
import { referralsEnabled } from "@/lib/pricing";
import { rateLimited } from "@/lib/rate-limit";
import {
  claimReferralCode,
  creditBalanceCents,
  getReferralCode,
  listLedger,
  referralStats,
  suggestCode,
} from "@/lib/referrals";

/** The signed-in user's referral code, link, stats, and credit ledger. */
export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const [code, balance, ledger] = await Promise.all([
    getReferralCode(auth.user.id),
    creditBalanceCents(auth.user.id),
    listLedger(auth.user.id),
  ]);
  const stats = code ? await referralStats(code.code) : null;
  return NextResponse.json({
    enabled: referralsEnabled(),
    code: code?.code ?? null,
    suggested: suggestCode(auth.user),
    url: code ? `${appUrl()}/${code.code}` : null,
    stats,
    balance_cents: balance,
    ledger,
  });
}

/** Claims (or renames) the user's referral code. */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!referralsEnabled()) return jsonError("Referral program is not open yet", 403);
  const limited = await rateLimited("referral-claim", 10, 60);
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const raw = typeof body.code === "string" ? body.code : "";
  const result = await claimReferralCode(auth.user.id, raw);
  if (!result.ok) return jsonError(result.error, 400);
  return NextResponse.json({ code: result.code, url: `${appUrl()}/${result.code}` });
}
