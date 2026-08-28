import { AppHeader } from "@/components/app-header";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage() {
  const { user, lang } = await requireOnboardedUser("/projects/new");
  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} userName={user.name} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">{t(lang, "dashboard_title")}</p>
        <h1 className="display text-5xl mb-3">{t(lang, "new_project_title")}</h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{t(lang, "new_project_sub")}</p>
        <div className="sheet p-8">
          <NewProjectForm lang={lang} />
        </div>
      </main>
    </div>
  );
}
