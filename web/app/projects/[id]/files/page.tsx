import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { isAdmin } from "@/lib/admin";
import {
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILES_PER_PROJECT,
  MAX_TOTAL_BYTES_PER_PROJECT,
} from "@/lib/file-limits";
import { fileUsage, listFiles } from "@/lib/files";
import { locale, t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { canEdit, getMembership, getProject, isOwner } from "@/lib/projects";
import { translateOne } from "@/lib/translate";
import { FileCabinet } from "./files-client";

export const dynamic = "force-dynamic";

/**
 * Project file cabinet: PDF documents (plans, permits, quotes, contracts).
 * Every member can open and download; editors and owners upload; the
 * uploader or the owner deletes. Read-only once the project is archived.
 */
export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, lang } = await requireOnboardedUser(`/projects/${id}/files`);
  const [membership, project] = await Promise.all([getMembership(id, user.id), getProject(id)]);
  // The site admin can open any project read-only.
  const role = membership ?? (isAdmin(user) ? ("commenter" as const) : null);
  if (!role || !project) notFound();

  const [files, usage, projectName] = await Promise.all([
    listFiles(id),
    fileUsage(id),
    translateOne(project.name, project.name_lang, lang),
  ]);

  const editable = canEdit(role) && !project.archived_at;
  const owner = isOwner(role);
  const dateFmt = new Intl.DateTimeFormat(locale(lang), { dateStyle: "medium" });
  const rows = files.map((f) => ({
    id: f.id,
    name: f.name,
    url: f.url,
    size: formatBytes(f.size_bytes),
    uploader: f.uploaded_by_name,
    date: dateFmt.format(new Date(f.created_at)),
    canDelete: editable && (owner || f.uploaded_by === user.id),
  }));
  const pctUsed = Math.min(100, Math.round((usage.bytes / MAX_TOTAL_BYTES_PER_PROJECT) * 100));

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <div className="sheet grid-paper p-6 sm:p-8 mb-8">
          <p className="microlabel mb-2">
            <Link href="/dashboard" className="hover:text-ink transition-colors">
              {t(lang, "dashboard_title")}
            </Link>{" "}
            /{" "}
            <Link href={`/projects/${id}`} className="hover:text-ink transition-colors">
              {projectName}
            </Link>
          </p>
          <h1 className="display text-3xl sm:text-5xl break-words">{t(lang, "files_title")}</h1>
          <p className="text-sm text-ink-soft mt-3 max-w-xl">{t(lang, "files_intro")}</p>

          <div className="mt-6">
            <div className="h-2.5 bg-sheet border border-line-strong rounded-[2px] overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${pctUsed}%` }} />
            </div>
            <p className="microlabel mt-2">
              {t(lang, "files_usage", {
                count: usage.count,
                max: MAX_FILES_PER_PROJECT,
                used: formatBytes(usage.bytes),
                total: formatBytes(MAX_TOTAL_BYTES_PER_PROJECT),
              })}
            </p>
          </div>

          {project.archived_at && (
            <p className="microlabel text-accent mt-4">{t(lang, "files_archived_note")}</p>
          )}
        </div>

        <FileCabinet
          projectId={id}
          files={rows}
          usage={usage}
          canUpload={editable}
          limitsLabel={t(lang, "files_limits", {
            size: formatBytes(MAX_FILE_BYTES),
            count: MAX_FILES_PER_PROJECT,
            total: formatBytes(MAX_TOTAL_BYTES_PER_PROJECT),
          })}
          lang={lang}
        />
      </main>
    </div>
  );
}
