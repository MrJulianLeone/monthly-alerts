import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomePage, homeMetadata } from "@/components/pages/home";
import { getCurrentUser, getVisitorLang } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata(await getVisitorLang());
}

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <HomePage lang={await getVisitorLang()} />;
}
