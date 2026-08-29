import Link from "next/link";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { t, type Lang } from "@/lib/i18n";

/**
 * Shared chrome and section blocks for the audience marketing pages
 * (/for-contractors, /renovating-in-italy, /for-designers, /for-homeowners).
 * Page bodies are English — these pages target English-speaking buyers and
 * carry English SEO metadata — while header/footer chrome stays localized.
 */
export function MarketingShell({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LangToggle current={lang} />
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
  kicker,
  title,
  sub,
  cta = "Start a project",
}: {
  kicker: string;
  title: string;
  sub: string;
  cta?: string;
}) {
  return (
    <section className="grid-paper border-b-[1.5px] border-line-strong">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
        <p className="microlabel mb-6">{kicker}</p>
        <h1 className="display text-5xl sm:text-7xl max-w-3xl mb-6">{title}</h1>
        <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">{sub}</p>
        <Link href="/login" className="btn btn-primary text-base px-8 py-3">
          {cta}
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
  children,
}: {
  title: string;
  items: string[];
  note?: string;
  children?: React.ReactNode;
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
        {children}
      </div>
    </section>
  );
}

export function PricingCta({ blurb }: { blurb: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20">
      <div className="sheet grid-paper p-10 sm:p-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <p className="microlabel mb-3">Pricing</p>
          <p className="display text-6xl sm:text-7xl">
            {PROJECT_PRICE_DISPLAY}
            <span className="text-2xl text-ink-soft ml-3 align-middle normal-case tracking-normal font-sans font-medium">
              per project
            </span>
          </p>
          <p className="text-sm text-ink-soft leading-relaxed max-w-md mt-4">{blurb}</p>
          <p className="chip text-accent mt-4">Free for everyone you invite</p>
        </div>
        <Link href="/login" className="btn btn-primary text-base px-8 py-3 shrink-0">
          Start a project
        </Link>
      </div>
    </section>
  );
}

const MARKET_PAGES = [
  {
    href: "/for-contractors",
    title: "For remodeling contractors",
    blurb: "English–Spanish checklists your whole crew can read.",
  },
  {
    href: "/renovating-in-italy",
    title: "Renovating in Italy",
    blurb: "Run an Italian renovation from the United States.",
  },
  {
    href: "/for-designers",
    title: "For designers & architects",
    blurb: "Client-ready checklists with automatic monthly reports.",
  },
  {
    href: "/for-homeowners",
    title: "For homeowners",
    blurb: "Track everything your contractor promised, in both languages.",
  },
];

/** Internal links between the audience pages, minus the one you're on. */
export function MarketCrossLinks({ current }: { current: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20">
      <p className="microlabel mb-4">Also on MonthlyAlerts</p>
      <div className="grid sm:grid-cols-3 gap-px bg-line-strong border-[1.5px] border-line-strong">
        {MARKET_PAGES.filter((p) => p.href !== current).map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="bg-sheet p-6 hover:bg-paper transition-colors"
          >
            <h3 className="display text-xl mb-1.5">{p.title}</h3>
            <p className="text-sm text-ink-soft leading-relaxed">{p.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
