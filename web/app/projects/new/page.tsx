import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { billingEnabled, PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage() {
  const { user, lang } = await requireOnboardedUser("/projects/new");
  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">{t(lang, "dashboard_title")}</p>
        <h1 className="display text-5xl mb-3">{t(lang, "new_project_title")}</h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-8">{t(lang, "new_project_sub")}</p>
        <div className="sheet p-8">
          <NewProjectForm lang={lang} />
        </div>
        <div className="microlabel leading-relaxed mt-4 space-y-1">
          {billingEnabled() && (
            <p>{t(lang, "new_project_fee", { price: PROJECT_PRICE_DISPLAY })}</p>
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
