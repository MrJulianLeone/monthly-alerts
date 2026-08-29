import type { Metadata } from "next";
import {
  ForContractorsPage,
  forContractorsMetadata,
} from "@/components/pages/for-contractors";
import { getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return forContractorsMetadata(await getVisitorLang());
}

export default async function Page() {
  return <ForContractorsPage lang={await getVisitorLang()} />;
}
