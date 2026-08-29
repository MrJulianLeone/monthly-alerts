import type { Metadata } from "next";
import Link from "next/link";
import { HtmlLang } from "@/components/html-lang";
import { LangToggle } from "@/components/lang-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { PROJECT_PRICE_DISPLAY } from "@/lib/billing";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";
import { localeAlternates } from "@/lib/seo";

const HOME_META: Record<Lang, { title: string; desc: string }> = {
  en: {
    title: "MonthlyAlerts — Multilingual construction checklists",
    desc: "One project checklist your whole crew can read. Items, comments, and updates translated automatically into every member's language.",
  },
  it: {
    title: "MonthlyAlerts — Liste di controllo multilingue per l'edilizia",
    desc: "Una sola lista di progetto che tutta la squadra può leggere. Voci, commenti e aggiornamenti tradotti automaticamente nella lingua di ogni membro.",
  },
  es: {
    title: "MonthlyAlerts — Listas de obra multilingües",
    desc: "Una sola lista de proyecto que toda tu cuadrilla puede leer. Tareas, comentarios y novedades traducidas automáticamente al idioma de cada miembro.",
  },
};

export function homeMetadata(lang: Lang): Metadata {
  const m = HOME_META[lang];
  return {
    title: m.title,
    description: m.desc,
    alternates: localeAlternates(lang, "/"),
  };
}

export function HomePage({ lang }: { lang: Lang }) {
  const features = [
    { title: t(lang, "landing_feature_1_title"), body: t(lang, "landing_feature_1_body") },
    { title: t(lang, "landing_feature_2_title"), body: t(lang, "landing_feature_2_body") },
    { title: t(lang, "landing_feature_3_title"), body: t(lang, "landing_feature_3_body") },
  ];

  const steps = [
    { title: t(lang, "hiw_step1_title"), body: t(lang, "hiw_step1_body") },
    { title: t(lang, "hiw_step2_title"), body: t(lang, "hiw_step2_body") },
    { title: t(lang, "hiw_step3_title"), body: t(lang, "hiw_step3_body") },
    { title: t(lang, "hiw_step4_title"), body: t(lang, "hiw_step4_body") },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <HtmlLang lang={lang} />
      <header className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <LangToggle current={lang} basePath="/" />
            <Link href="/login" className="btn btn-ghost btn-sm">
              {t(lang, "log_in")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="grid-paper border-b-[1.5px] border-line-strong">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-20 sm:py-28">
            <p className="microlabel mb-6">
              {t(lang, "app_name")} — {t(lang, "app_descriptor")} —{" "}
              {LANGUAGES.map((l) => l.code.toUpperCase()).join(" ⇄ ")}
            </p>
            <h1 className="display text-5xl sm:text-7xl max-w-3xl mb-6">
              {t(lang, "landing_tagline")}
            </h1>
            <p className="text-lg text-ink-soft max-w-xl mb-10 leading-relaxed">
              {t(lang, "landing_sub")}
            </p>
            <Link href="/login" className="btn btn-primary text-base px-8 py-3">
              {t(lang, "landing_cta")}
            </Link>
          </div>
        </section>

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

        <section className="border-y-[1.5px] border-line-strong bg-sheet">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
            <h2 className="display text-4xl mb-10">{t(lang, "hiw_title")}</h2>
            <ol className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <span className="display text-4xl text-accent shrink-0 leading-none">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="display text-xl mb-1.5">{s.title}</h3>
                    <p className="text-sm text-ink-soft leading-relaxed">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="sheet grid-paper p-6 sm:p-8 max-w-xl">
              <p className="microlabel mb-4">{t(lang, "hiw_demo_label")}</p>
              <ul className="space-y-2.5">
                {[
                  { code: "EN", text: "Install kitchen cabinets" },
                  { code: "IT", text: "Installare i mobili della cucina" },
                  { code: "ES", text: "Instalar los gabinetes de cocina" },
                ].map((row) => (
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
          </div>
        </section>

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
              <p className="text-sm text-ink-soft leading-relaxed max-w-md mt-3">
                {t(lang, "pricing_body")}
              </p>
              <p className="chip text-accent mt-4">{t(lang, "pricing_invitees_free")}</p>
              <p className="microlabel leading-relaxed max-w-md mt-4">
                {t(lang, "expiry_hint")}
              </p>
            </div>
            <Link href="/login" className="btn btn-primary text-base px-8 py-3 shrink-0">
              {t(lang, "landing_cta")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
