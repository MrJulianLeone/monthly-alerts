import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, PricingCta } from "@/components/marketing";
import { getTemplate } from "@/lib/content";
import { LANGUAGES, type Lang } from "@/lib/i18n";
import { SITE_URL } from "@/lib/seo";
import { translateBatch } from "@/lib/translate";

export const metadata: Metadata = {
  title: "Demo: one construction checklist in English, Italian, and Spanish — MonthlyAlerts",
  description:
    "See exactly what each member of a renovation project sees: the same checklist, the same comments, each in their own language, plus the monthly status report every member receives.",
  alternates: { canonical: `${SITE_URL}/demo` },
};

// Rendered per request (translations are cached content-addressed in
// Postgres, so this costs one translation per item per language, ever).
export const dynamic = "force-dynamic";

const DEMO_TEMPLATE = "kitchen-renovation-checklist";
const DEMO_SECTIONS = 3;
const DEMO_ITEMS = 6;

const COMMENTS: { author: string; lang: Lang; text: string }[] = [
  { author: "Miguel (tile sub)", lang: "es", text: "La plomería estará terminada el viernes. ¿Confirmamos la altura del nicho?" },
  { author: "Sarah (owner)", lang: "en", text: "Yes. Niche at 48 inches to the bottom, centered on the shower wall." },
  { author: "Luca (architetto)", lang: "it", text: "Confermo. Attenzione: il tubo dell'acqua calda passa a destra della nicchia." },
];

export default async function DemoPage() {
  const tpl = getTemplate(DEMO_TEMPLATE);
  const sections = (tpl?.sections ?? []).slice(0, DEMO_SECTIONS).map((s) => ({
    name: s.name,
    items: s.items.slice(0, DEMO_ITEMS).map((i) => i.title),
  }));

  // One batch per language: section names, item titles, then comments.
  const source = [
    ...sections.flatMap((s) => [{ text: s.name, lang: "en" as Lang }, ...s.items.map((t) => ({ text: t, lang: "en" as Lang }))]),
    ...COMMENTS.map((c) => ({ text: c.text, lang: c.lang })),
  ];
  const columns = await Promise.all(
    LANGUAGES.map(async (l) => {
      const out = await translateBatch(source, l.code);
      let idx = 0;
      const secs = sections.map((s) => {
        const name = out[idx++];
        const items = s.items.map(() => out[idx++]);
        return { name, items };
      });
      const comments = COMMENTS.map((c, i) => ({ ...c, text: out[idx + i] }));
      return { lang: l, sections: secs, comments };
    })
  );

  const statusLabel: Record<Lang, [string, string, string]> = {
    en: ["Open", "In progress", "Done"],
    it: ["Aperto", "In corso", "Fatto"],
    es: ["Abierto", "En curso", "Hecho"],
  };

  return (
    <MarketingShell lang="en" basePath="/demo" langToggle={false}>
      <section className="grid-paper border-b-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="microlabel mb-5">Demo · EN ⇄ IT ⇄ ES</p>
          <h1 className="display text-5xl sm:text-6xl max-w-3xl mb-6">
            One project. Three people. Three languages. Same list.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-8">
            Below is the same kitchen-renovation project as the owner, the Italian architect, and the
            Spanish-speaking tile sub each see it. Nobody translated anything: they wrote in their own
            language and read the others&apos; words in theirs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/checklists/${DEMO_TEMPLATE}`} className="btn btn-primary text-base px-8 py-3">
              Start this project free
            </Link>
            <Link href="/checklists" className="btn btn-ghost text-base px-6 py-3">
              All templates
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <p className="microlabel mb-4">The checklist, per member</p>
        <div className="grid lg:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.lang.code} className="sheet p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="chip">{col.lang.code.toUpperCase()} · {col.lang.label}</span>
                <span className="microlabel">
                  {col.lang.code === "en" ? "Sarah, owner" : col.lang.code === "it" ? "Luca, architetto" : "Miguel, azulejos"}
                </span>
              </div>
              {col.sections.map((s, si) => (
                <div key={si} className="mb-5">
                  <p className="display text-lg border-b-2 border-ink pb-1 mb-1">
                    <span className="text-ink-faint mr-2">{String(si + 1).padStart(2, "0")}</span>
                    {s.name}
                  </p>
                  <ul className="divide-y divide-line">
                    {s.items.map((item, ii) => {
                      const state = ii < 2 ? 2 : ii === 2 ? 1 : 0;
                      return (
                        <li key={ii} className="flex items-center gap-2.5 py-2">
                          <span
                            className={`inline-flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] border-ink rounded-[2px] text-[10px] leading-none ${
                              state === 2 ? "bg-ink text-white" : ""
                            }`}
                            aria-hidden="true"
                          >
                            {state === 2 ? "✓" : ""}
                          </span>
                          <span className={`text-sm flex-1 ${state === 2 ? "line-through text-ink-faint" : ""}`}>{item}</span>
                          {state === 1 && <span className="chip text-accent">{statusLabel[col.lang.code][1]}</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <p className="microlabel mt-2 mb-2">Comments on “{col.sections[1]?.items[2] ?? ""}”</p>
              <ul className="space-y-3">
                {col.comments.map((c, i) => (
                  <li key={i} className="border-l-2 border-line-strong pl-3">
                    <p className="microlabel text-ink">
                      {c.author}
                      {c.lang !== col.lang.code && (
                        <span className="text-ink-faint ml-2 normal-case tracking-normal">
                          · {c.lang.toUpperCase()}
                        </span>
                      )}
                    </p>
                    <p className="text-sm leading-relaxed mt-0.5">{c.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="microlabel mt-4 max-w-2xl leading-relaxed">
          Live translations from the product, not mock-ups. Automated translations are for project
          communication and should not replace certified translations of legal, engineering, or
          safety-critical documentation.
        </p>
      </section>

      <section className="border-y-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="microlabel mb-3">The monthly report</p>
            <h2 className="display text-4xl mb-4">On the 1st, everyone gets this. In their language.</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-3">
              No one writes it. It is generated from the checklist: what got done, what was added,
              what is overdue. The owner stays current; the contractor writes nothing extra; the
              client stops asking “where are we?”
            </p>
            <p className="text-sm text-ink-soft leading-relaxed">
              Owners can preview the report in each language before activating a project.
            </p>
          </div>
          <div className="sheet p-6 max-w-md w-full">
            <p className="microlabel mb-5">Monthly<span className="text-accent">Alerts</span> · sample</p>
            <h3 className="display text-2xl mb-1">Kitchen Renovation</h3>
            <p className="text-sm text-ink-soft mb-5">August 2026 status</p>
            <div className="h-2.5 bg-paper border border-line-strong rounded-[2px] overflow-hidden">
              <div className="h-full bg-accent" style={{ width: "62%" }} />
            </div>
            <p className="microlabel mt-2 mb-4">47 of 76 complete (62%)</p>
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Completed this month", "19"],
                  ["Added this month", "4"],
                  ["Overdue", "2"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 text-ink-soft border-b border-line">{k}</td>
                    <td className="py-2 font-semibold text-right border-b border-line">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm font-semibold mt-5 mb-1">Overdue items</p>
            <ul className="list-disc pl-5 text-sm text-ink-soft space-y-1">
              <li>Confirm countertop template date with fabricator</li>
              <li>Order range hood (6 week lead time)</li>
            </ul>
          </div>
        </div>
      </section>

      <PricingCta
        lang="en"
        blurb="Build the checklist free. Activate for a one-time fee to invite your team — everyone you invite joins free, in their own language."
      />
    </MarketingShell>
  );
}
