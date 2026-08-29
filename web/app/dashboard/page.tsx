import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { listProjectsForUser } from "@/lib/projects";
import { translateBatch } from "@/lib/translate";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, lang } = await requireOnboardedUser("/dashboard");
  const projects = await listProjectsForUser(user.id);
  const names = await translateBatch(
    projects.map((p) => ({ text: p.name, lang: p.name_lang })),
    lang
  );

  const roleKey = { owner: "role_owner", editor: "role_editor", commenter: "role_commenter" } as const;

  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="microlabel mb-2">{t(lang, "app_name")}</p>
            <h1 className="display text-5xl">{t(lang, "dashboard_title")}</h1>
          </div>
          <Link href="/projects/new" className="btn btn-primary">
            + {t(lang, "new_project")}
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="sheet grid-paper p-12 text-center">
            <h2 className="display text-3xl mb-3">{t(lang, "dashboard_empty_title")}</h2>
            <p className="text-sm text-ink-soft max-w-sm mx-auto mb-8">
              {t(lang, "dashboard_empty_body")}
            </p>
            <Link href="/projects/new" className="btn btn-primary">
              + {t(lang, "new_project")}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {projects.map((p, i) => {
              const pct = p.total_items > 0 ? Math.round((p.done_items / p.total_items) * 100) : 0;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className={`sheet p-6 hover:border-ink transition-colors group ${
                    p.archived_at ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h2 className="display text-2xl group-hover:text-accent transition-colors">
                      {names[i]}
                    </h2>
                    <span className="chip text-ink-faint shrink-0 mt-1.5">
                      {p.archived_at ? t(lang, "archived") : t(lang, roleKey[p.role])}
                    </span>
                  </div>
                  {p.address && <p className="text-sm text-ink-soft mb-4">{p.address}</p>}
                  <div className="mt-4">
                    <div className="h-2 bg-paper border border-line-strong rounded-[2px] overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="microlabel mt-2">
                      {t(lang, "progress_done", { done: p.done_items, total: p.total_items })} — {pct}%
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
