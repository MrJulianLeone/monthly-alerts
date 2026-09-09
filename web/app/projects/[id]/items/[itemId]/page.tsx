import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import { sql } from "@/lib/db";
import { langName, t, type Lang, locale } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { canEdit, getMembership, getProject, isOwner, listMembers } from "@/lib/projects";
import { translateBatch, type Translatable } from "@/lib/translate";
import { CommentForm, DeleteCommentButton, DeleteItemButton, ItemEditor, PhotoGrid } from "./item-client";

export const dynamic = "force-dynamic";

type ItemRow = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  source_lang: Lang;
  status: "open" | "in_progress" | "done";
  assignee_id: string | null;
  due_date: string | null;
  created_by_name: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  body: string;
  source_lang: Lang;
  author_id: string;
  author_name: string | null;
  created_at: string;
};

type RevisionRow = {
  id: string;
  title: string;
  description: string | null;
  source_lang: Lang;
  replaced_by_name: string | null;
  replaced_at: string;
};

type PhotoRow = {
  id: string;
  url: string;
  uploaded_by: string | null;
  caption: string | null;
  caption_lang: Lang | null;
};

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const { user, lang } = await requireOnboardedUser(`/projects/${id}/items/${itemId}`);
  const [membership, project] = await Promise.all([getMembership(id, user.id), getProject(id)]);
  // The site admin can open any project read-only.
  const role = membership ?? (isAdmin(user) ? ("commenter" as const) : null);
  if (!role || !project) notFound();

  const items = (await sql()`
    SELECT i.id, i.section_id, i.title, i.description, i.source_lang, i.status,
           i.assignee_id, i.due_date::text AS due_date,
           c.name AS created_by_name, i.created_at
    FROM items i LEFT JOIN users c ON c.id = i.created_by
    WHERE i.id = ${itemId} AND i.project_id = ${id}
  `) as ItemRow[];
  if (items.length === 0) notFound();
  const item = items[0];

  const [comments, photos, members, revisions] = await Promise.all([
    sql()`
      SELECT c.id, c.body, c.source_lang, c.author_id, u.name AS author_name, c.created_at
      FROM comments c JOIN users u ON u.id = c.author_id
      WHERE c.item_id = ${itemId}
      ORDER BY c.created_at
    ` as unknown as Promise<CommentRow[]>,
    sql()`
      SELECT id, url, uploaded_by, caption, caption_lang
      FROM photos WHERE item_id = ${itemId} ORDER BY created_at
    ` as unknown as Promise<PhotoRow[]>,
    listMembers(id),
    sql()`
      SELECT r.id, r.title, r.description, r.source_lang, u.name AS replaced_by_name, r.replaced_at
      FROM item_revisions r LEFT JOIN users u ON u.id = r.replaced_by
      WHERE r.item_id = ${itemId}
      ORDER BY r.replaced_at DESC
    ` as unknown as Promise<RevisionRow[]>,
  ]);

  const texts: Translatable[] = [
    { text: item.title, lang: item.source_lang },
    { text: item.description ?? "", lang: item.source_lang },
    ...comments.map((c) => ({ text: c.body, lang: c.source_lang })),
    ...photos.map((p) => ({ text: p.caption ?? "", lang: p.caption_lang ?? lang })),
    ...revisions.map((r) => ({ text: r.title, lang: r.source_lang })),
  ];
  const translated = await translateBatch(texts, lang);
  const title = translated[0];
  const description = translated[1];
  const commentBodies = translated.slice(2, 2 + comments.length);
  const photoCaptions = translated.slice(2 + comments.length, 2 + comments.length + photos.length);
  const revisionTitles = translated.slice(2 + comments.length + photos.length);
  const anyTranslated =
    item.source_lang !== lang ||
    comments.some((c) => c.source_lang !== lang) ||
    revisions.some((r) => r.source_lang !== lang);

  const editable = canEdit(role) && !project.archived_at;
  const owner = isOwner(role);
  const dateFmt = new Intl.DateTimeFormat(locale(lang), {
    dateStyle: "medium",
  });

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-4">
          <Link href={`/projects/${id}`} className="hover:text-ink transition-colors">
            ← {t(lang, "back")}
          </Link>
        </p>

        <div className="sheet p-6 sm:p-8 mb-6">
          <ItemEditor
            itemId={item.id}
            title={title}
            description={description || null}
            originalTitle={item.title}
            translatedFrom={
              item.source_lang !== lang
                ? t(lang, "translated_note", { lang: langName(item.source_lang) })
                : null
            }
            status={item.status}
            assigneeId={item.assignee_id}
            dueDate={item.due_date}
            members={members.map((m) => ({ id: m.user_id, name: m.name ?? m.email }))}
            editable={editable}
            lang={lang}
          />
          <p className="microlabel mt-6">
            {item.created_by_name
              ? `${t(lang, "added_by", { name: item.created_by_name })} — `
              : ""}
            {dateFmt.format(new Date(item.created_at))}
            {" · "}
            {t(lang, "written_in", { lang: langName(item.source_lang) })}
          </p>
          {revisions.length > 0 && (
            <details className="mt-4 pt-4 border-t border-line">
              <summary className="microlabel cursor-pointer hover:text-ink">
                {t(lang, "history_title")} · {revisions.length}
              </summary>
              <ul className="mt-3 space-y-3">
                {revisions.map((r, i) => (
                  <li key={r.id} className="border-l-2 border-line-strong pl-4">
                    <p className="text-sm" title={revisionTitles[i] !== r.title ? r.title : undefined}>
                      {revisionTitles[i]}
                    </p>
                    {r.description && (
                      <p className="text-xs text-ink-soft whitespace-pre-wrap mt-1">{r.description}</p>
                    )}
                    <p className="microlabel mt-1">
                      {t(lang, "history_replaced", {
                        name: r.replaced_by_name ?? "—",
                        date: dateFmt.format(new Date(r.replaced_at)),
                        lang: langName(r.source_lang),
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </details>
          )}
          {anyTranslated && (
            <p className="microlabel mt-4 leading-relaxed">{t(lang, "translation_disclosure")}</p>
          )}
          {owner && !project.archived_at && (
            <div className="mt-4 pt-4 border-t border-line">
              <DeleteItemButton itemId={item.id} projectId={id} lang={lang} />
            </div>
          )}
        </div>

        {/* Photos */}
        <div className="sheet p-6 sm:p-8 mb-6">
          <h2 className="display text-xl mb-4">
            {t(lang, "photos")}{" "}
            <span className="text-ink-faint">{photos.length > 0 ? photos.length : ""}</span>
          </h2>
          <PhotoGrid
            itemId={item.id}
            photos={photos.map((p, i) => ({
              id: p.id,
              url: p.url,
              caption: photoCaptions[i] ?? "",
              canDelete: !project.archived_at && (owner || p.uploaded_by === user.id),
            }))}
            canUpload={editable}
            lang={lang}
          />
        </div>

        {/* Comments */}
        <div className="sheet p-6 sm:p-8">
          <h2 className="display text-xl mb-4">
            {t(lang, "comments")}{" "}
            <span className="text-ink-faint">{comments.length > 0 ? comments.length : ""}</span>
          </h2>
          {comments.length === 0 && (
            <p className="text-sm text-ink-faint mb-4">{t(lang, "no_comments")}</p>
          )}
          <ul className="space-y-4 mb-6">
            {comments.map((c, i) => (
              <li key={c.id} className="border-l-2 border-line-strong pl-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="microlabel text-ink">
                    {c.author_name ?? "—"}
                    <span className="text-ink-faint ml-2 normal-case tracking-normal">
                      {dateFmt.format(new Date(c.created_at))}
                      {c.source_lang !== lang ? ` · ${langName(c.source_lang)}` : ""}
                    </span>
                  </p>
                  {!project.archived_at && (owner || c.author_id === user.id) && (
                    <DeleteCommentButton commentId={c.id} lang={lang} />
                  )}
                </div>
                <p
                  className="text-[15px] leading-relaxed mt-1 whitespace-pre-wrap"
                  title={commentBodies[i] !== c.body ? c.body : undefined}
                >
                  {commentBodies[i]}
                </p>
              </li>
            ))}
          </ul>
          {!project.archived_at && <CommentForm itemId={item.id} lang={lang} />}
        </div>
      </main>
    </div>
  );
}
