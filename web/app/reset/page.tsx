import Link from "next/link";
import { Logo } from "@/components/logo";
import { getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { ResetForm } from "./reset-form";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const lang = await getVisitorLang();
  const { token } = await searchParams;

  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="sheet p-8 sm:p-10">
            <p className="microlabel mb-3">{t(lang, "app_name")}</p>
            <h1 className="display text-4xl mb-6">{t(lang, "reset_title")}</h1>
            {token ? (
              <ResetForm lang={lang} token={token} />
            ) : (
              <p className="text-sm text-accent-deep">{t(lang, "login_invalid_link")}</p>
            )}
          </div>
          <p className="microlabel text-center mt-6">
            <Link href="/login" className="hover:text-ink transition-colors">
              ← {t(lang, "log_in")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
