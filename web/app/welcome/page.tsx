import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getCurrentUser, getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { WelcomeForm } from "./welcome-form";

/**
 * First-login onboarding: collects basic information and the preferred
 * language before anything else is usable.
 */
export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";
  if (user.onboarded_at) redirect(next);
  // Signup and invitations record an initial language on the account
  // (invitees get the language the owner chose), so prefer that.
  const lang = user.preferred_language ?? (await getVisitorLang());

  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center">
          <Logo href="/welcome" />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md sheet p-8 sm:p-10">
          <p className="microlabel mb-3">{user.email}</p>
          <h1 className="display text-4xl mb-3">{t(lang, "welcome_title")}</h1>
          <p className="text-sm text-ink-soft leading-relaxed mb-8">{t(lang, "welcome_sub")}</p>
          <WelcomeForm initialLang={lang} next={next} />
        </div>
      </main>
    </div>
  );
}
