import Link from "next/link";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { getVisitorLang } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { ForgotForm } from "./forgot-form";

export default async function ForgotPage() {
  const lang = await getVisitorLang();
  return (
    <div className="min-h-screen grid-paper flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <LangToggle current={lang} />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="sheet p-8 sm:p-10">
            <p className="microlabel mb-3">{t(lang, "app_name")}</p>
            <h1 className="display text-4xl mb-3">{t(lang, "forgot_title")}</h1>
            <p className="text-sm text-ink-soft leading-relaxed mb-8">{t(lang, "forgot_sub")}</p>
            <ForgotForm lang={lang} />
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
