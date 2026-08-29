import Link from "next/link";
import { HtmlLang } from "@/components/html-lang";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { t, type Lang } from "@/lib/i18n";
import { localePath } from "@/lib/seo";

/**
 * Shared chrome and section blocks for the audience marketing pages
 * (/for-contractors, /renovating-in-italy, /for-designers, /for-homeowners).
 * Body copy lives in each page's COPY dictionary keyed by Lang; the blocks
 * here are string-driven, with chrome labels coming from lib/i18n.
 */
export function MarketingShell({
  lang,
  basePath,
  children,
}: {
  lang: Lang;
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <HtmlLang lang={lang} />
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LangToggle current={lang} basePath={basePath} />
            <Link href="/login" className="btn btn-ghost btn-sm">
              {t(lang, "log_in")}
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}

export function MarketingHero({
  lang,
  kicker,
  title,
  sub,
}: {
  lang: Lang;
  kicker: string;
  title: string;
  sub: string;
}) {
  return (
    <section className="grid-paper border-b-[1.5px] border-line-strong">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
        <p className="microlabel mb-6">{kicker}</p>
        <h1 className="display text-5xl sm:text-7xl max-w-3xl mb-6">{title}</h1>
        <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">{sub}</p>
        <Link href="/login" className="btn btn-primary text-base px-8 py-3">
          {t(lang, "landing_cta")}
        </Link>
      </div>
    </section>
  );
}

/** The type-it-once / crew-sees-it-instantly checklist demo card. */
export function TranslationDemo({
  label,
  rows,
}: {
  label: string;
  rows: { code: string; text: string }[];
}) {
  return (
    <div className="sheet grid-paper p-6 sm:p-8 max-w-xl">
      <p className="microlabel mb-4">{label}</p>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.code} className="flex items-center gap-3">
            <span
              className="inline-flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] border-ink rounded-[2px] bg-ink text-white text-[10px] leading-none"
              aria-hidden="true"
            >
              ✓
            </span>
            <span className="text-sm flex-1">{row.text}</span>
            <span className="chip text-ink-faint">{row.code}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FeatureGrid({
  features,
}: {
  features: { title: string; body: string }[];
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
      <div className="grid sm:grid-cols-3 gap-px bg-line-strong border-[1.5px] border-line-strong">
        {features.map((f, i) => (
          <div key={f.title} className="bg-sheet p-8">
            <p className="microlabel mb-4">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="display text-2xl mb-3">{f.title}</h2>
            <p className="text-sm text-ink-soft leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AudienceBand({
  title,
  items,
  note,
}: {
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <section className="border-y-[1.5px] border-line-strong bg-sheet">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
        <h2 className="display text-4xl mb-8">{title}</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line-strong border-[1.5px] border-line-strong mb-6">
          {items.map((item) => (
            <li key={item} className="bg-paper p-4 text-sm leading-snug">
              {item}
            </li>
          ))}
        </ul>
        {note && <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">{note}</p>}
      </div>
    </section>
  );
}

export function PricingCta({ lang, blurb }: { lang: Lang; blurb: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
      <div className="sheet grid-paper p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <p className="microlabel mb-3">{t(lang, "pricing_label")}</p>
          <p className="display text-6xl sm:text-7xl">
            {PROJECT_PRICE_DISPLAY}
            <span className="text-2xl text-ink-soft ml-3 align-middle normal-case tracking-normal font-sans font-medium">
              {t(lang, "pricing_per_project")}
            </span>
          </p>
          <p className="text-sm font-semibold mt-3">{t(lang, "pricing_not_monthly")}</p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-md mt-3">{blurb}</p>
          <p className="chip text-accent mt-4">{t(lang, "pricing_invitees_free")}</p>
        </div>
        <Link href="/login" className="btn btn-primary text-base px-8 py-3 shrink-0">
          {t(lang, "landing_cta")}
        </Link>
      </div>
    </section>
  );
}

const CROSS_LINKS_LABEL: Record<Lang, string> = {
  en: "Also on MonthlyAlerts",
  it: "Anche su MonthlyAlerts",
  es: "También en MonthlyAlerts",
};

const MARKET_PAGES: {
  href: string;
  title: Record<Lang, string>;
  blurb: Record<Lang, string>;
}[] = [
  {
    href: "/for-contractors",
    title: {
      en: "For remodeling contractors",
      it: "Per imprese di ristrutturazione",
      es: "Para contratistas de remodelación",
    },
    blurb: {
      en: "English–Spanish checklists your whole crew can read.",
      it: "Liste inglese–spagnolo che tutta la squadra può leggere.",
      es: "Listas inglés–español que toda tu cuadrilla puede leer.",
    },
  },
  {
    href: "/renovating-abroad",
    title: {
      en: "Renovating abroad",
      it: "Ristrutturare dall'estero",
      es: "Renovar en el extranjero",
    },
    blurb: {
      en: "Run an overseas renovation, whatever language the site speaks.",
      it: "Cantieri con clienti all'estero, ognuno nella propria lingua.",
      es: "Gestiona una renovación en el extranjero, cada quien en su idioma.",
    },
  },
  {
    href: "/for-designers",
    title: {
      en: "For designers & architects",
      it: "Per designer e architetti",
      es: "Para diseñadores y arquitectos",
    },
    blurb: {
      en: "Client-ready checklists with automatic monthly reports.",
      it: "Checklist per i clienti con report mensili automatici.",
      es: "Listas profesionales con informes mensuales automáticos.",
    },
  },
  {
    href: "/for-homeowners",
    title: {
      en: "For homeowners",
      it: "Per proprietari di casa",
      es: "Para propietarios",
    },
    blurb: {
      en: "Track everything your contractor promised, in both languages.",
      it: "Tieni traccia di ciò che l'impresa ha promesso, in due lingue.",
      es: "Sigue todo lo que prometió tu contratista, en ambos idiomas.",
    },
  },
];

/** Internal links between the audience pages, minus the one you're on. */
export function MarketCrossLinks({ lang, current }: { lang: Lang; current: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
      <p className="microlabel mb-4">{CROSS_LINKS_LABEL[lang]}</p>
      <div className="grid sm:grid-cols-3 gap-px bg-line-strong border-[1.5px] border-line-strong">
        {MARKET_PAGES.filter((p) => p.href !== current).map((p) => (
          <Link
            key={p.href}
            href={localePath(lang, p.href)}
            className="bg-sheet p-6 hover:bg-paper transition-colors"
          >
            <h3 className="display text-xl mb-1.5">{p.title[lang]}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{p.blurb[lang]}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
