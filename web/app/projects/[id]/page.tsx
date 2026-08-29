import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { isLang, LANGUAGES, langName, locale, t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import {
  canEdit,
  getMembership,
  getProject,
  isOwner,
  listItems,
  listMembers,
  listSections,
} from "@/lib/projects";
import { translateBatch, type Translatable } from "@/lib/translate";
import { AddItemForm, AddSectionForm, PrintButton, SectionTools, StatusCheckbox } from "./checklist";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const { user, lang: userLang } = await requireOnboardedUser(`/projects/${id}`);
  const [membership, project] = await Promise.all([getMembership(id, user.id), getProject(id)]);
  // The site admin can open any project read-only.
  const role = membership ?? (isAdmin(user) ? ("commenter" as const) : null);
  if (!role || !project) notFound();

  // Owners can preview the checklist as members in another language see it.
  const requested = (await searchParams).lang;
  const previewLang =
    role === "owner" && isLang(requested) && requested !== userLang ? requested : null;
  const lang = previewLang ?? userLang;

  const [sections, items, members] = await Promise.all([
    listSections(id),
    listItems(id),
    listMembers(id),
  ]);

  // One batched, cached translation pass for everything on the page.
  const texts: Translatable[] = [
    { text: project.name, lang: project.name_lang },
    ...sections.map((s) => ({ text: s.name, lang: s.name_lang })),
    ...items.map((i) => ({ text: i.title, lang: i.source_lang })),
  ];
  const translated = await translateBatch(texts, lang);
  const projectName = translated[0];
  const sectionNames = translated.slice(1, 1 + sections.length);
  const itemTitles = translated.slice(1 + sections.length);

  const editable = canEdit(role) && !project.archived_at;
  const owner = isOwner(role);
  const done = items.filter((i) => i.status === "done").length;
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const dateFmt = new Intl.DateTimeFormat(locale(lang), {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        {/* Title block */}
        <div className="sheet grid-paper p-6 sm:p-8 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="microlabel mb-2">
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                  {t(lang, "dashboard_title")}
                </Link>{" "}
                / {project.archived_at ? t(lang, "archived") : `${pct}%`}
              </p>
              <h1 className="display text-4xl sm:text-5xl break-words">{projectName}</h1>
              {project.address && (
                <p className="text-sm text-ink-soft mt-2">{project.address}</p>
              )}
            </div>
            {owner && (
              <Link
                href={`/projects/${id}/settings`}
                className="btn btn-ghost btn-sm shrink-0"
              >
                {t(lang, "project_settings")}
              </Link>
            )}
          </div>
          <div className="mt-6">
            <div className="h-2.5 bg-sheet border border-line-strong rounded-[2px] overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <p className="microlabel">
                {t(lang, "progress_done", { done, total: items.length })}
              </p>
              <p className="microlabel">
                {members.length} · {t(lang, "members")}
              </p>
            </div>
          </div>
          <div className="no-print flex flex-wrap items-center justify-between gap-3 mt-5 pt-4 border-t border-line">
            <PrintButton label={t(lang, "print")} />
            {owner && (
              <div className="flex items-center gap-2">
                <span className="microlabel">{t(lang, "preview_language")}:</span>
                {LANGUAGES.map((l) => (
                  <Link
                    key={l.code}
                    href={
                      l.code === userLang ? `/projects/${id}` : `/projects/${id}?lang=${l.code}`
                    }
                    className={`px-2 py-1 text-[11px] font-mono uppercase tracking-widest rounded-[2px] border transition-colors ${
                      l.code === lang
                        ? "bg-ink text-white border-ink"
                        : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {l.code}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {previewLang && (
            <p className="no-print microlabel text-accent mt-3">
              {t(lang, "preview_language_note", { lang: langName(previewLang) })} —{" "}
              <Link href={`/projects/${id}`} className="underline hover:text-ink">
                {t(lang, "preview_exit")}
              </Link>
            </p>
          )}
        </div>

        {/* Sections */}
        {sections.length === 0 && (
          <p className="text-sm text-ink-soft text-center py-8">{t(lang, "no_sections_yet")}</p>
        )}
        <div className="space-y-8">
          {sections.map((section, si) => {
            const sectionItems = items
              .map((item, ii) => ({ item, title: itemTitles[ii] }))
              .filter(({ item }) => item.section_id === section.id);
            return (
              <section key={section.id}>
                <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-1">
                  <h2 className="display text-2xl">
                    <span className="text-ink-faint mr-2">{String(si + 1).padStart(2, "0")}</span>
                    {sectionNames[si]}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="microlabel">
                      {sectionItems.filter(({ item }) => item.status === "done").length}/
                      {sectionItems.length}
                    </span>
                    {editable && <SectionTools sectionId={section.id} isOwner={owner} lang={lang} />}
                  </div>
                </div>
                <ul className="divide-y divide-line">
                  {sectionItems.length === 0 && !editable && (
                    <li className="py-3 text-sm text-ink-faint">{t(lang, "no_items_yet")}</li>
                  )}
                  {sectionItems.map(({ item, title }) => {
                    const overdue =
                      item.due_date !== null && item.due_date < today && item.status !== "done";
                    return (
                      <li key={item.id} className="flex items-center gap-3 py-2.5 group">
                        <StatusCheckbox
                          itemId={item.id}
                          status={item.status}
                          disabled={!editable}
                        />
                        <Link
                          href={`/projects/${id}/items/${item.id}`}
                          className="flex-1 min-w-0 flex items-center gap-3"
                        >
                          <span
                            className={`text-[15px] truncate group-hover:text-accent-deep transition-colors ${
                              item.status === "done" ? "line-through text-ink-faint" : ""
                            }`}
                            title={title !== item.title ? item.title : undefined}
                          >
                            {title}
                          </span>
                          {item.status === "in_progress" && (
                            <span className="chip text-accent shrink-0">
                              {t(lang, "status_in_progress")}
                            </span>
                          )}
                          {item.due_date && (
                            <span
                              className={`chip shrink-0 ${
                                overdue ? "text-red-700" : "text-ink-faint"
                              }`}
                            >
                              {overdue ? `⚠ ${t(lang, "overdue")} · ` : ""}
                              {dateFmt.format(new Date(`${item.due_date}T12:00:00`))}
                            </span>
                          )}
                          <span className="ml-auto shrink-0 flex items-center gap-2 microlabel">
                            {item.assignee_name && (
                              <span title={item.assignee_name}>
                                {item.assignee_name
                                  .split(/\s+/)
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            )}
                            {item.photo_count > 0 && <span>▣{item.photo_count}</span>}
                            {item.comment_count > 0 && <span>✎{item.comment_count}</span>}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                  {editable && (
                    <li className="no-print py-2.5">
                      <AddItemForm projectId={id} sectionId={section.id} lang={lang} />
                    </li>
                  )}
                </ul>
              </section>
            );
          })}
        </div>

        {editable && (
          <div className="no-print mt-10">
            <AddSectionForm projectId={id} lang={lang} />
          </div>
        )}
      </main>
    </div>
  );
}
