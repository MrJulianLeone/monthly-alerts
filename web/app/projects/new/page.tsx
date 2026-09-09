import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { billingEnabled, PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { t } from "@/lib/i18n";
import { getTemplate, templateItemCount } from "@/lib/content";
import { requireOnboardedUser } from "@/lib/page-auth";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template: slug } = await searchParams;
  const { user, lang } = await requireOnboardedUser(
    slug ? `/projects/new?template=${encodeURIComponent(slug)}` : "/projects/new"
  );
  const template = slug ? getTemplate(slug) : null;
  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">{t(lang, "dashboard_title")}</p>
        <h1 className="display text-5xl mb-3">{t(lang, "new_project_title")}</h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{t(lang, "new_project_sub")}</p>
        {template && (
          <p className="text-sm border-[1.5px] border-accent rounded-[2px] px-4 py-3 mb-6">
            {t(lang, "new_project_template_note", {
              name: template.name,
              count: templateItemCount(template),
            })}
          </p>
        )}
        <div className="sheet p-8">
          <NewProjectForm
            lang={lang}
            template={template ? { slug: template.slug, name: template.name } : null}
          />
        </div>
        <div className="microlabel leading-relaxed mt-4 space-y-1">
          {billingEnabled() && (
            <p>{t(lang, "new_project_draft_fee", { price: PROJECT_PRICE_DISPLAY })}</p>
          )}
          <p>{t(lang, "expiry_hint")}</p>
          <p>
            {t(lang, "new_project_legal")}{" "}
            <Link href="/terms" className="underline hover:text-ink">
              {t(lang, "footer_terms")}
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="underline hover:text-ink">
              {t(lang, "footer_privacy")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
