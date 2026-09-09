import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGrid, FaqList, JsonLd } from "@/components/content";
import { AudienceBand, MarketingShell, PricingCta } from "@/components/marketing";
import { getCurrentUser } from "@/lib/auth";
import { CLUSTER_LABELS, getTemplate, guidesForTemplate, TEMPLATES, templateItemCount } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tpl = getTemplate((await params).slug);
  if (!tpl) return {};
  const url = `${SITE_URL}/checklists/${tpl.slug}`;
  return {
    title: `${tpl.metaTitle} — MonthlyAlerts`,
    description: tpl.metaDesc,
    keywords: tpl.keywords,
    alternates: { canonical: url },
    openGraph: { title: tpl.metaTitle, description: tpl.metaDesc, url },
  };
}

export const dynamic = "force-dynamic"; // the CTA depends on the session

export default async function ChecklistTemplatePage({ params }: Props) {
  const tpl = getTemplate((await params).slug);
  if (!tpl) notFound();
  const user = await getCurrentUser();
  const startHref = user
    ? `/projects/new?template=${tpl.slug}`
    : `/login?next=${encodeURIComponent(`/projects/new?template=${tpl.slug}`)}`;
  const count = templateItemCount(tpl);
  const guides = guidesForTemplate(tpl);
  const related = (tpl.related ?? []).map((s) => getTemplate(s)).filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <MarketingShell lang="en" basePath={`/checklists/${tpl.slug}`} langToggle={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: tpl.name,
          description: tpl.metaDesc,
          datePublished: tpl.publishedAt,
          step: tpl.sections.map((s, i) => ({
            "@type": "HowToSection",
            position: i + 1,
            name: s.name,
            itemListElement: s.items.map((it, j) => ({
              "@type": "HowToStep",
              position: j + 1,
              name: it.title,
              ...(it.description ? { text: it.description } : {}),
            })),
          })),
        }}
      />

      <section className="grid-paper border-b-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="microlabel mb-5">
            <Link href="/checklists" className="hover:text-ink">Checklist templates</Link> · {tpl.kicker}
          </p>
          <h1 className="display text-5xl sm:text-7xl max-w-3xl mb-6">{tpl.name} checklist</h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed mb-8">{tpl.intro}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href={startHref} className="btn btn-primary text-base px-8 py-3">
              Start a project from this template
            </Link>
            <span className="microlabel">
              {tpl.sections.length} phases · {count} items · free to build, translated for every member
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_280px] gap-10">
        <div>
          {tpl.sections.map((section, si) => (
            <section key={section.name} className="mb-10">
              <h2 className="display text-2xl border-b-2 border-ink pb-2 mb-1">
                <span className="text-ink-faint mr-2">{String(si + 1).padStart(2, "0")}</span>
                {section.name}
              </h2>
              <ul className="divide-y divide-line">
                {section.items.map((item) => (
                  <li key={item.title} className="flex gap-3 py-2.5">
                    <span
                      className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center border-[1.5px] border-ink rounded-[2px]"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-[15px]">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-ink-soft leading-relaxed mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <aside className="lg:sticky lg:top-6 self-start space-y-6">
          <div className="sheet grid-paper p-5">
            <p className="microlabel mb-3">How to use it</p>
            {tpl.howToUse.map((p, i) => (
              <p key={i} className="text-sm text-ink-soft leading-relaxed mb-3">
                {p}
              </p>
            ))}
            <Link href={startHref} className="btn btn-primary btn-sm w-full mt-2">
              Use this template
            </Link>
          </div>
          <div className="sheet p-5">
            <p className="microlabel mb-3">Every member reads it in their language</p>
            <ul className="space-y-1.5 text-sm">
              {["EN — English", "IT — Italiano", "ES — Español"].map((l) => (
                <li key={l} className="font-mono text-ink-soft">{l}</li>
              ))}
            </ul>
            <p className="text-xs text-ink-faint leading-relaxed mt-3">
              Items you add or edit are translated automatically for everyone you invite.{" "}
              <Link href="/demo" className="underline hover:text-ink">See the demo</Link>.
            </p>
          </div>
        </aside>
      </section>

      <AudienceBand title="Who uses this checklist" items={tpl.audience} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {tpl.faq && <FaqList title="Questions people ask" faq={tpl.faq} />}
        {guides.length > 0 && (
          <CardGrid
            label="Read before you start"
            cards={guides.map((g) => ({
              href: `/guides/${g.slug}`,
              title: g.title,
              blurb: g.metaDesc,
              meta: CLUSTER_LABELS[g.cluster],
            }))}
          />
        )}
        {related.length > 0 && (
          <CardGrid
            label="Other templates"
            cards={related.map((r) => ({
              href: `/checklists/${r.slug}`,
              title: r.name,
              blurb: r.intro,
              meta: `${r.sections.length} phases · ${templateItemCount(r)} items`,
            }))}
          />
        )}
      </div>

      <PricingCta
        lang="en"
        blurb="Start from this template free. Activate for a one-time fee when you're ready to invite your team, start monthly reports, and keep the project for two years."
      />
    </MarketingShell>
  );
}
