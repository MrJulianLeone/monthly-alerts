import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomePage, homeMetadata } from "@/components/pages/home";
import { getCurrentUser } from "@/lib/auth";
import { findReferralCode } from "@/lib/referrals";
import { resolvePrefixLocale } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = resolvePrefixLocale((await params).lang);
  return lang ? homeMetadata(lang) : {};
}

/**
 * Language-prefixed home (/it, /es) — and the referral vanity URL
 * (monthlyalerts.com/ANDREALEONE), which cookies the visitor via /r/CODE
 * and lands on the English home.
 */
export default async function LocalizedLandingPage({ params }: Props) {
  const raw = (await params).lang;
  const lang = resolvePrefixLocale(raw);
  if (!lang) {
    const code = await findReferralCode(raw);
    if (code) redirect(`/r/${code.code}`);
    notFound();
  }
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <HomePage lang={lang} />;
}
