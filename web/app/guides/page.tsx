import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, PricingCta } from "@/components/marketing";
import { CLUSTER_LABELS, GUIDES, TEMPLATES, templateItemCount, type Guide } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Renovation guides: Italy, multilingual crews, remote projects — MonthlyAlerts",
  description:
    "Practical guides for homeowners and contractors: renovating in Italy from the US, working with Spanish-speaking crews, managing a renovation remotely, punch lists, and progress reports.",
  alternates: { canonical: `${SITE_URL}/guides` },
};

const ORDER: Guide["cluster"][] = ["italy", "multilingual", "remote", "remodeling"];

export default function GuidesIndex() {
  return (
    <MarketingShell lang="en" basePath="/guides" langToggle={false}>
      <section className="grid-paper border-b-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="microlabel mb-5">Guides</p>
          <h1 className="display text-5xl sm:text-6xl max-w-3xl mb-6">
            Renovation guides for projects that cross a language.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">
            Written for owners and contractors who run real projects: what to track, what to ask,
            and what goes wrong when the crew, the architect, and the client don&apos;t share a
            language.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        {ORDER.map((cluster) => {
          const guides = GUIDES.filter((g) => g.cluster === cluster);
          if (guides.length === 0) return null;
          return (
            <section key={cluster} className="mb-14">
              <h2 className="display text-3xl border-b-2 border-ink pb-2 mb-4">{CLUSTER_LABELS[cluster]}</h2>
              <ul className="divide-y divide-line">
                {guides.map((g) => (
                  <li key={g.slug} className="py-4">
                    <Link href={`/guides/${g.slug}`} className="group block">
                      <h3 className="display text-xl group-hover:text-accent-deep transition-colors">{g.title}</h3>
                      <p className="text-sm text-ink-soft leading-relaxed mt-1 max-w-2xl">{g.metaDesc}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="mb-6">
          <h2 className="display text-3xl border-b-2 border-ink pb-2 mb-4">Checklist templates</h2>
          <div className="grid sm:grid-cols-2 gap-px bg-line-strong border-[1.5px] border-line-strong">
            {TEMPLATES.map((tpl) => (
              <Link key={tpl.slug} href={`/checklists/${tpl.slug}`} className="bg-sheet p-6 hover:bg-paper transition-colors">
                <p className="microlabel mb-2">
                  {tpl.sections.length} phases · {templateItemCount(tpl)} items
                </p>
                <h3 className="display text-xl mb-1.5">{tpl.name}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{tpl.intro}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <PricingCta
        lang="en"
        blurb="Build your checklist free, preview it in every language, then activate for a one-time fee to invite your team and start monthly reports."
      />
    </MarketingShell>
  );
}
