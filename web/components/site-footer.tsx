import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { t, type Lang } from "@/lib/i18n";

/** Standard footer for every public page (landing, contact, legal, auth). */
export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t-[1.5px] border-line-strong">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
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
          <Link href="/contact" className="microlabel hover:text-ink transition-colors">
            {t(lang, "footer_contact")}
          </Link>
          <span className="microlabel">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
