import Link from "next/link";
import { sql } from "@/lib/db";
import { suppress, type Prospect } from "@/lib/prospecting";

export const dynamic = "force-dynamic";

// One-click unsubscribe for outreach email (linked in every footer and in
// the List-Unsubscribe header). No auth, no confirmation step — the polite
// thing is to just stop. Idempotent.

export default async function OutreachUnsubscribePage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;

  let done = false;
  try {
    const rows = (await sql()`
      SELECT * FROM prospects WHERE visit_token = ${token}
    `) as Prospect[];
    const prospect = rows[0];
    if (prospect) {
      if (prospect.email) await suppress(prospect.email, "unsubscribe");
      await sql()`
        UPDATE prospects
        SET status = 'suppressed', status_note = 'Unsubscribed via link', updated_at = now()
        WHERE id = ${prospect.id}
      `;
      done = true;
    }
  } catch (err) {
    console.error("outreach unsubscribe failed:", err);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="microlabel mb-4">
          Monthly<span className="text-accent-deep">Alerts</span>
        </p>
        <h1 className="display text-3xl mb-4">{done ? "You're unsubscribed" : "All set"}</h1>
        <p className="text-sm text-ink-soft mb-8">
          {done
            ? "We won't email you again. Sorry for the interruption."
            : "This link is no longer active, and you won't receive further emails."}
        </p>
        <Link href="/" className="btn btn-ghost btn-sm">
          monthlyalerts.com
        </Link>
      </div>
    </div>
  );
}
