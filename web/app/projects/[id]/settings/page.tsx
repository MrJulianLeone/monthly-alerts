import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { sql } from "@/lib/db";
import { t, type Lang, locale } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { getMembership, getProject, listMembers, projectExpiresAt } from "@/lib/projects";
import {
  ArchiveButtons,
  DeleteProjectButton,
  InviteForm,
  InviteRow,
  MemberRow,
  ProjectDetailsForm,
} from "./settings-client";

export const dynamic = "force-dynamic";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, lang } = await requireOnboardedUser(`/projects/${id}/settings`);
  const [role, project] = await Promise.all([getMembership(id, user.id), getProject(id)]);
  if (!role || !project || role !== "owner") notFound();

  const [members, invites] = await Promise.all([
    listMembers(id),
    sql()`
      SELECT id, email, role, expires_at FROM invites
      WHERE project_id = ${id} AND accepted_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC
    ` as unknown as Promise<{ id: string; email: string; role: string; expires_at: string }[]>,
  ]);

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
        <h1 className="display text-5xl mb-8">{t(lang, "settings_project_title")}</h1>

        <div className="sheet p-6 sm:p-8 mb-6">
          <ProjectDetailsForm
            projectId={id}
            name={project.name}
            address={project.address ?? ""}
            description={project.description ?? ""}
            lang={lang}
          />
        </div>

        <div className="sheet p-6 sm:p-8 mb-6">
          <h2 className="display text-xl mb-5">{t(lang, "members")}</h2>
          <ul className="divide-y divide-line mb-6">
            {members.map((m) => (
              <MemberRow
                key={m.user_id}
                projectId={id}
                userId={m.user_id}
                name={m.name ?? m.email}
                email={m.email}
                company={m.company}
                memberLang={m.preferred_language}
                role={m.role}
                isProjectOwner={m.user_id === project.owner_id}
                lang={lang}
              />
            ))}
          </ul>

          <h3 className="display text-lg mb-3">{t(lang, "invite_member")}</h3>
          <InviteForm projectId={id} lang={lang} />

          {invites.length > 0 && (
            <>
              <h3 className="display text-lg mt-8 mb-3">{t(lang, "invite_pending")}</h3>
              <ul className="divide-y divide-line">
                {invites.map((inv) => (
                  <InviteRow
                    key={inv.id}
                    inviteId={inv.id}
                    email={inv.email}
                    role={inv.role as "editor" | "commenter"}
                    expires={t(lang, "invite_expires", {
                      date: dateFmt.format(new Date(inv.expires_at)),
                    })}
                    lang={lang}
                  />
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="sheet p-6 sm:p-8">
          <p className="microlabel mb-2">
            {t(lang, "project_expires", { date: dateFmt.format(projectExpiresAt(project)) })}
          </p>
          <p className="text-sm text-ink-soft mb-4">{t(lang, "expiry_hint")}</p>
          <p className="text-sm text-ink-soft mb-4">{t(lang, "archive_hint")}</p>
          <div className="flex flex-wrap gap-3">
            <ArchiveButtons projectId={id} archived={!!project.archived_at} lang={lang} />
            <DeleteProjectButton projectId={id} lang={lang} />
          </div>
        </div>
      </main>
    </div>
  );
}
