import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { isDraft } from "@/lib/billing";
import { isLang, LANGUAGES, langName, locale, t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { getMembership, getProject, isOwner, listMembers } from "@/lib/projects";
import { projectStatus } from "@/lib/report";
import { translateBatch } from "@/lib/translate";

export const dynamic = "force-dynamic";

/**
 * In-app preview of the monthly status report — the email every member gets
 * on the 1st, rendered from live numbers. Owners can preview it in each
 * language, which is also how drafts see what activation buys.
 */
export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { user, lang: userLang } = await requireOnboardedUser(`/projects/${id}/report`);
  const [membership, project] = await Promise.all([getMembership(id, user.id), getProject(id)]);
  const role = membership ?? (isAdmin(user) ? ("commenter" as const) : null);
  if (!role || !project) notFound();

  const requested = (await searchParams).lang;
  const previewLang =
    isOwner(role) && isLang(requested) && requested !== userLang ? requested : null;
  const lang = previewLang ?? userLang;

  const [status, members] = await Promise.all([projectStatus(id), listMembers(id)]);
  const [projectName, ...overdueTitles] = await translateBatch(
    [
      { text: project.name, lang: project.name_lang },
      ...status.overdue.map((o) => ({ text: o.title, lang: o.source_lang })),
    ],
    lang
  );
  const pct = status.total_items > 0 ? Math.round((status.done_items / status.total_items) * 100) : 0;
  const reported = new Date();
  reported.setDate(0);
  const monthLabel = new Intl.DateTimeFormat(locale(lang), { month: "long", year: "numeric" }).format(
    reported
  );
  const recipients = members.filter((m) => m.preferred_language !== lang).length;

  const stat = (label: string, value: string | number) => (
    <tr>
      <td className="py-2.5 text-sm text-ink-soft border-b border-line">{label}</td>
      <td className="py-2.5 text-sm font-semibold text-right border-b border-line">{value}</td>
    </tr>
  );

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-4">
          <Link href={`/projects/${id}`} className="hover:text-ink transition-colors">
            ← {t(lang, "back")}
          </Link>
        </p>
        <h1 className="display text-4xl mb-2">{t(lang, "report_title")}</h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-6 max-w-xl">
          {isDraft(project) ? t(lang, "report_draft_note") : t(lang, "report_preview_note")}
          {recipients > 0 && !isDraft(project) ? ` ${t(lang, "report_recipients_note", { count: recipients })}` : ""}
        </p>

        {isOwner(role) && (
          <div className="no-print flex items-center gap-2 mb-6">
            <span className="microlabel">{t(lang, "preview_language")}:</span>
            {LANGUAGES.map((l) => (
              <Link
                key={l.code}
                href={l.code === userLang ? `/projects/${id}/report` : `/projects/${id}/report?lang=${l.code}`}
                className={`px-2 py-1 text-[11px] font-mono uppercase tracking-widest rounded-[2px] border transition-colors ${
                  l.code === lang
                    ? "bg-ink text-white border-ink"
                    : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {l.code}
              </Link>
            ))}
            {previewLang && (
              <span className="microlabel text-accent ml-2">
                {t(lang, "preview_language_note", { lang: langName(previewLang) })}
              </span>
            )}
          </div>
        )}

        {/* The email, as a sheet */}
        <div className="sheet p-6 sm:p-8">
          <p className="microlabel mb-6">
            Monthly<span className="text-accent">Alerts</span>
          </p>
          <h2 className="display text-2xl mb-1">{projectName}</h2>
          <p className="text-sm text-ink-soft mb-6">{t(lang, "email_monthly_title", { month: monthLabel })}</p>
          <div className="h-2.5 bg-paper border border-line-strong rounded-[2px] overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </div>
          <p className="microlabel mt-2 mb-5">
            {t(lang, "progress_done", { done: status.done_items, total: status.total_items })} ({pct}%)
          </p>
          <table className="w-full border-collapse mb-2">
            <tbody>
              {stat(t(lang, "email_monthly_completed"), status.completed_this_month)}
              {stat(t(lang, "email_monthly_added"), status.added_this_month)}
              {stat(t(lang, "email_monthly_overdue"), status.overdue_count)}
            </tbody>
          </table>
          {overdueTitles.length > 0 && (
            <>
              <p className="text-sm font-semibold mt-6 mb-2">{t(lang, "email_monthly_overdue_list")}</p>
              <ul className="list-disc pl-5 space-y-1">
                {overdueTitles.map((title, i) => (
                  <li key={i} className="text-sm text-ink-soft">
                    {title}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-7">
            <span className="btn btn-primary btn-sm pointer-events-none">
              {t(lang, "email_monthly_open_project")}
            </span>
          </p>
          <hr className="border-line my-6" />
          <p className="microlabel">{t(lang, "email_footer")}</p>
        </div>
      </main>
    </div>
  );
}
