import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CardGrid, FaqList, GuideBody, JsonLd } from "@/components/content";
import { MarketingShell, PricingCta } from "@/components/marketing";
import { CLUSTER_LABELS, getGuide, GUIDES, relatedGuides, templateItemCount, templatesForGuide } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const url = `${SITE_URL}/guides/${guide.slug}`;
  return {
    title: `${guide.metaTitle} — MonthlyAlerts`,
    description: guide.metaDesc,
    keywords: guide.keywords,
    alternates: { canonical: url },
    openGraph: { title: guide.metaTitle, description: guide.metaDesc, url, type: "article" },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const related = relatedGuides(guide);
  const templates = templatesForGuide(guide);
  const cta = guide.cta ?? "/for-homeowners";

  return (
    <MarketingShell lang="en" basePath={`/guides/${guide.slug}`} langToggle={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.metaDesc,
          datePublished: guide.publishedAt,
          author: { "@type": "Organization", name: "MonthlyAlerts" },
          publisher: { "@type": "Organization", name: "MonthlyAlerts", url: SITE_URL },
          mainEntityOfPage: `${SITE_URL}/guides/${guide.slug}`,
        }}
      />
      {guide.faq && guide.faq.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: guide.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <section className="grid-paper border-b-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="microlabel mb-5">
            <Link href="/guides" className="hover:text-ink">Guides</Link> / {CLUSTER_LABELS[guide.cluster]}
            {" · "}
            {guide.kicker}
          </p>
          <h1 className="display text-4xl sm:text-6xl max-w-3xl mb-6">{guide.title}</h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">{guide.intro}</p>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <GuideBody blocks={guide.blocks} />
        {guide.faq && <FaqList title="Questions people ask" faq={guide.faq} />}

        {templates.length > 0 && (
          <CardGrid
            label="Start with a checklist"
            cards={templates.map((tpl) => ({
              href: `/checklists/${tpl.slug}`,
              title: tpl.name,
              blurb: tpl.intro,
              meta: `${tpl.sections.length} phases · ${templateItemCount(tpl)} items · free to start`,
            }))}
          />
        )}
        <CardGrid
          label="Related guides"
          cards={related.map((g) => ({
            href: `/guides/${g.slug}`,
            title: g.title,
            blurb: g.metaDesc,
            meta: CLUSTER_LABELS[g.cluster],
          }))}
        />
        <p className="microlabel mt-10 max-w-2xl leading-relaxed">
          Published {new Date(guide.publishedAt + "T12:00:00Z").toLocaleDateString("en-US", { dateStyle: "long" })}.
          This guide is general information, not legal, engineering, or tax advice. Rules change; confirm
          anything that matters with a licensed professional in the jurisdiction of the property.
        </p>
      </article>

      <PricingCta
        lang="en"
        blurb="One-time fee when you activate a project — no subscription. Build the checklist free first, preview it in every language, then activate to invite your team."
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <Link href={cta} className="microlabel underline hover:text-ink">
          How MonthlyAlerts works for this →
        </Link>
      </section>
    </MarketingShell>
  );
}
