import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ForContractorsPage,
  forContractorsMetadata,
} from "@/components/pages/for-contractors";
import { PREFIX_LOCALES, resolvePrefixLocale } from "@/lib/seo";

type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return PREFIX_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = resolvePrefixLocale((await params).lang);
  return lang ? forContractorsMetadata(lang) : {};
}

export default async function Page({ params }: Props) {
  const lang = resolvePrefixLocale((await params).lang);
  if (!lang) notFound();
  return <ForContractorsPage lang={lang} />;
}
