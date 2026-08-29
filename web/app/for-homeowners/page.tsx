import type { Metadata } from "next";
import {
  ForHomeownersPage,
  forHomeownersMetadata,
} from "@/components/pages/for-homeowners";
import { getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return forHomeownersMetadata(await getVisitorLang());
}

export default async function Page() {
  return <ForHomeownersPage lang={await getVisitorLang()} />;
}
