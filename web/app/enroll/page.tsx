import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { EnrollForm } from "./enroll-form";

export const metadata = { title: "Start coaching — MonthlyAlerts" };
export const dynamic = "force-dynamic";

/** Existing accounts (typically parents) enroll as coached users here. */
export default async function EnrollPage() {
  const user = await requirePageUser();
  const existing = (await sql()`
    SELECT 1 FROM profiles WHERE user_id = ${user.id}
  `) as unknown[];
  if (existing.length > 0) redirect("/chat");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <EnrollForm />
    </main>
  );
}
