import type { Metadata } from "next";
import {
  RenovatingAbroadPage,
  renovatingAbroadMetadata,
} from "@/components/pages/renovating-abroad";
import { getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return renovatingAbroadMetadata(await getVisitorLang());
}

export default async function Page() {
  return <RenovatingAbroadPage lang={await getVisitorLang()} />;
}
