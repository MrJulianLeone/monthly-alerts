import Link from "next/link";
import { LogoMark } from "@/components/logo";
import { t, type Lang, type MessageKey } from "@/lib/i18n";

const MARKET_LINKS: { href: string; label: MessageKey }[] = [
  { href: "/for-contractors", label: "footer_for_contractors" },
  { href: "/renovating-in-italy", label: "footer_renovating_italy" },
  { href: "/for-designers", label: "footer_for_designers" },
  { href: "/for-homeowners", label: "footer_for_homeowners" },
];

/* Phone-size taps: links get tall touch targets, and the footer keeps clear
   of the bottom screen edge (home indicator / Safari toolbar) on mobile. */
const LINK_CLASS =
  "microlabel hover:text-ink transition-colors inline-block py-2.5 sm:py-0";

/** Standard footer for every public page (landing, contact, legal, auth). */
export function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t-[1.5px] border-line-strong">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-4 pb-[max(2.5rem,calc(1rem+env(safe-area-inset-bottom)))] sm:pb-4 space-y-1 sm:space-y-3">
        <nav className="flex flex-wrap items-center gap-x-5 sm:gap-x-4 gap-y-0 sm:gap-y-1">
          {MARKET_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={LINK_CLASS}>
              {t(lang, link.label)}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0 sm:gap-3">
          <div className="flex items-center gap-2 py-2.5 sm:py-0">
            <LogoMark size={14} />
            <span className="microlabel">{t(lang, "email_footer")}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 sm:gap-x-4 gap-y-0">
            <Link href="/terms" className={LINK_CLASS}>
              {t(lang, "footer_terms")}
            </Link>
            <Link href="/privacy" className={LINK_CLASS}>
              {t(lang, "footer_privacy")}
            </Link>
            <Link href="/contact" className={LINK_CLASS}>
              {t(lang, "footer_contact")}
            </Link>
            <span className="microlabel">© {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
