import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  RenovatingAbroadPage,
  renovatingAbroadMetadata,
} from "@/components/pages/renovating-abroad";
import { PREFIX_LOCALES, resolvePrefixLocale } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return PREFIX_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = resolvePrefixLocale((await params).lang);
  return lang ? renovatingAbroadMetadata(lang) : {};
}

export default async function Page({ params }: Props) {
  const lang = resolvePrefixLocale((await params).lang);
  if (!lang) notFound();
  return <RenovatingAbroadPage lang={lang} />;
}
