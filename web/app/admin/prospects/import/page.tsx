import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { requireOnboardedUser } from "@/lib/page-auth";
import { listSources } from "@/lib/roster";
import { PromoteButton, QuickAddForm, RosterImportForm } from "./import-forms";

export const dynamic = "force-dynamic";

// Admin-only prospect discovery: quick add + state license roster imports.

export default async function ProspectImportPage() {
  const { user } = await requireOnboardedUser("/admin/prospects/import");
  if (!isAdmin(user)) notFound();

  const sources = await listSources();
  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}
          <Link href="/admin/prospects" className="hover:text-accent-deep">Prospecting</Link>
          {" / Import"}
        </p>
        <h1 className="display text-5xl mb-8">Import</h1>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">Quick add</h2>
        <p className="text-sm text-ink-soft mb-3">
          Added prospects enter the pipeline immediately: the daily run researches the website,
          finds an email, scores fit, and drafts the outreach for your approval.
        </p>
        <div className="mb-10">
          <QuickAddForm />
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">State license rosters</h2>
        <div className="text-sm text-ink-soft mb-3 space-y-2">
          <p>
            Contractor licenses are public record. Free bulk downloads:{" "}
            <a className="underline hover:text-accent-deep" href="https://www.cslb.ca.gov/onlineservices/dataportal/" target="_blank" rel="noopener noreferrer">California CSLB</a>,{" "}
            <a className="underline hover:text-accent-deep" href="https://www.tdlr.texas.gov/licensesearch/licfile.asp" target="_blank" rel="noopener noreferrer">Texas TDLR</a>,{" "}
            <a className="underline hover:text-accent-deep" href="https://catalog.data.gov/dataset/li-contractor-license-data-general" target="_blank" rel="noopener noreferrer">Washington L&amp;I</a>.
            Download a CSV (or paste its URL), filter to your target slice — e.g. classification
            &ldquo;B-2&rdquo; remodelers licensed in the last two years — and stage it here.
          </p>
          <p>
            Staged rows sit in a holding area (max 20,000 per import) until you promote them, so a
            600k-row state file never floods the pipeline.
          </p>
        </div>
        <div className="mb-10">
          <RosterImportForm />
        </div>

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3">
          Staged imports <span className="text-ink-faint">{sources.length}</span>
        </h2>
        {sources.length === 0 ? (
          <p className="text-sm text-ink-faint">Nothing staged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Import", "Staged", "Awaiting promotion", "Last import", ""].map((h) => (
                    <th key={h} className="microlabel font-normal py-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {sources.map((s) => (
                  <tr key={s.source}>
                    <td className="py-2.5 pr-4 font-medium">{s.source}</td>
                    <td className="py-2.5 pr-4">{s.total.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">{s.pending.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-ink-soft">{fmt.format(new Date(s.last_import))}</td>
                    <td className="py-2.5">
                      <PromoteButton source={s.source} pending={s.pending} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="microlabel mt-4">
          Promotion takes the newest licenses first and dedupes against existing prospects, the
          suppression list, and current users.
        </p>
      </main>
    </div>
  );
}
