import Link from "next/link";
import { Logo, LogoMark } from "@/components/logo";
import { getVisitorLang, getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

/** Shared shell for the Terms and Privacy pages. */
export async function LegalPage({
  title,
  effective,
  children,
}: {
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const lang = user?.preferred_language ?? (await getVisitorLang());

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <Link href={user ? "/dashboard" : "/"} className="microlabel hover:text-ink transition-colors">
            ← {t(lang, "back")}
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <p className="microlabel mb-2">MonthlyAlerts.com — {effective}</p>
        <h1 className="display text-5xl mb-4">{title}</h1>
        {lang !== "en" && (
          <p className="text-sm text-ink-soft border-[1.5px] border-line-strong rounded-[2px] px-4 py-3 mb-6">
            {t(lang, "legal_english_note")}
          </p>
        )}
        <div className="legal-prose">{children}</div>
      </main>
      <footer className="border-t-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogoMark size={14} />
            <span className="microlabel">{t(lang, "email_footer")}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="microlabel hover:text-ink transition-colors">
              {t(lang, "footer_terms")}
            </Link>
            <Link href="/privacy" className="microlabel hover:text-ink transition-colors">
              {t(lang, "footer_privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
