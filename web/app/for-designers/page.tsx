import type { Metadata } from "next";
import {
  ForDesignersPage,
  forDesignersMetadata,
} from "@/components/pages/for-designers";
import { getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return forDesignersMetadata(await getVisitorLang());
}

export default async function Page() {
  return <ForDesignersPage lang={await getVisitorLang()} />;
}
