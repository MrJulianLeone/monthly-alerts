import { AppHeader } from "@/components/app-header";
import { t } from "@/lib/i18n";
import { requireOnboardedUser } from "@/lib/page-auth";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, lang } = await requireOnboardedUser("/settings");
  return (
    <div className="min-h-screen">
      <AppHeader lang={lang} user={user} />
      <main className="mx-auto max-w-xl px-4 sm:px-6 py-10">
        <p className="microlabel mb-2">{user.email}</p>
        <h1 className="display text-5xl mb-8">{t(lang, "settings_title")}</h1>
        <div className="sheet p-8">
          <SettingsForm
            initial={{
              name: user.name ?? "",
              company: user.company ?? "",
              phone: user.phone ?? "",
              preferred_language: user.preferred_language,
              email_opt_out: user.email_opt_out,
            }}
          />
        </div>
      </main>
    </div>
  );
}
