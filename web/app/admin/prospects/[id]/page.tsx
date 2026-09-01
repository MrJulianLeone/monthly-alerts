import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { requireOnboardedUser } from "@/lib/page-auth";
import { getProspect, listEmails } from "@/lib/prospecting";
import { ProspectEditor } from "./editor";

export const dynamic = "force-dynamic";

// Admin-only prospect detail: research, score, drafts, correspondence.

export default async function ProspectDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { user } = await requireOnboardedUser("/admin/prospects");
  if (!isAdmin(user)) notFound();

  const { id } = await props.params;
  const prospect = await getProspect(id);
  if (!prospect) notFound();

  const [emails, visits] = await Promise.all([
    listEmails(id),
    sql()`
      SELECT created_at, user_agent FROM prospect_visits
      WHERE prospect_id = ${id} ORDER BY created_at DESC LIMIT 20
    ` as unknown as Promise<{ created_at: string; user_agent: string | null }[]>,
  ]);

  const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
  const meta: [string, string | null][] = [
    ["Status", `${prospect.status}${prospect.status_note ? ` — ${prospect.status_note}` : ""}`],
    ["Source", prospect.source],
    ["Contact", prospect.contact_name],
    ["Email", prospect.email],
    ["Phone", prospect.phone],
    ["Location", [prospect.city, prospect.region].filter(Boolean).join(", ") || null],
    ["License", [prospect.classification, prospect.license_no].filter(Boolean).join(" · ") || null],
    ["License issued", prospect.license_issued],
    ["Reply", prospect.reply_class],
    ["Visits", prospect.visit_count ? String(prospect.visit_count) : null],
    ["Created", fmt.format(new Date(prospect.created_at))],
  ];

  return (
    <div className="min-h-screen">
      <AppHeader lang={user.preferred_language} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">
          <Link href="/admin" className="hover:text-accent-deep">Site administration</Link>
          {" / "}
          <Link href="/admin/prospects" className="hover:text-accent-deep">Prospecting</Link>
        </p>
        <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
          <h1 className="display text-4xl">{prospect.company}</h1>
          {prospect.website && (
            <a
              href={prospect.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Visit website
            </a>
          )}
        </div>

        <div className="grid sm:grid-cols-3 gap-x-8 gap-y-2 mb-8 text-sm">
          {meta
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <p key={k}>
                <span className="microlabel mr-2">{k}</span>
                <span className="text-ink-soft break-all">{v}</span>
              </p>
            ))}
        </div>

        {(prospect.score !== null || prospect.research) && (
          <div className="sheet p-5 mb-8">
            {prospect.score !== null && (
              <p className="mb-2">
                <span className="chip text-accent-deep mr-2">score {prospect.score}/10</span>
                <span className="text-sm text-ink-soft">{prospect.score_reason}</span>
              </p>
            )}
            {prospect.research && (
              <p className="text-sm text-ink-soft whitespace-pre-wrap">{prospect.research}</p>
            )}
          </div>
        )}

        <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-4">Emails</h2>
        <ProspectEditor
          id={prospect.id}
          status={prospect.status}
          email={prospect.email}
          website={prospect.website}
          drafts={{
            draft_subject: prospect.draft_subject ?? "",
            draft_body: prospect.draft_body ?? "",
            followup_subject: prospect.followup_subject ?? "",
            followup_body: prospect.followup_body ?? "",
          }}
        />

        {emails.length > 0 && (
          <>
            <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3 mt-10">
              Correspondence
            </h2>
            <div className="space-y-4 mb-10">
              {emails.map((e) => (
                <div key={e.id} className="sheet p-4">
                  <p className="microlabel mb-2">
                    {e.direction === "outbound" ? "You → " : "← "}
                    {e.kind}
                    {e.ai_class && ` · classified: ${e.ai_class}`}
                    {" · "}
                    {fmt.format(new Date(e.created_at))}
                  </p>
                  {e.subject && <p className="text-sm font-medium mb-1">{e.subject}</p>}
                  <p className="text-sm text-ink-soft whitespace-pre-wrap">
                    {(e.body_text ?? "").slice(0, 3000)}
                  </p>
                  {e.ai_note && <p className="microlabel mt-2">AI: {e.ai_note}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        {visits.length > 0 && (
          <>
            <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-3 mt-10">
              Site visits <span className="text-ink-faint">{prospect.visit_count}</span>
            </h2>
            <div className="divide-y divide-line border-y-[1.5px] border-line-strong">
              {visits.map((v, i) => (
                <p key={i} className="py-2 text-sm text-ink-soft">
                  {fmt.format(new Date(v.created_at))}
                  <span className="text-ink-faint text-xs ml-3">{v.user_agent?.slice(0, 80)}</span>
                </p>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
