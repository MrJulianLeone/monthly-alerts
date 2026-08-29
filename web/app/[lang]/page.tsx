import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { HomePage, homeMetadata } from "@/components/pages/home";
import { getCurrentUser } from "@/lib/auth";
import { resolvePrefixLocale } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = resolvePrefixLocale((await params).lang);
  return lang ? homeMetadata(lang) : {};
}

export default async function LocalizedLandingPage({ params }: Props) {
  const lang = resolvePrefixLocale((await params).lang);
  if (!lang) notFound();
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <HomePage lang={lang} />;
}
