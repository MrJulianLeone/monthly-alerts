import type { Metadata } from "next";
import {
  RenovatingInItalyPage,
  renovatingInItalyMetadata,
} from "@/components/pages/renovating-in-italy";
import { getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return renovatingInItalyMetadata(await getVisitorLang());
}

export default async function Page() {
  return <RenovatingInItalyPage lang={await getVisitorLang()} />;
}
