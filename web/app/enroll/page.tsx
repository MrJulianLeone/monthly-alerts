import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { requirePageUser } from "@/lib/page-auth";
import { EnrollForm } from "./enroll-form";

export const metadata = { title: "Start coaching — MonthlyAlerts" };
export const dynamic = "force-dynamic";

/** Existing accounts (typically parents) enroll as coached users here. */
export default async function EnrollPage() {
  const user = await requirePageUser();
  const rows = (await sql()`
    SELECT u.name, u.date_of_birth,
           EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id) AS has_profile
    FROM users u WHERE u.id = ${user.id}
  `) as { name: string | null; date_of_birth: string | Date | null; has_profile: boolean }[];
  if (rows[0]?.has_profile) redirect("/me");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <EnrollForm
        initialName={rows[0]?.name ?? ""}
        initialDob={
          rows[0]?.date_of_birth
            ? new Date(rows[0].date_of_birth).toISOString().slice(0, 10)
            : ""
        }
      />
    </main>
  );
}
