import type { Metadata } from "next";
import Link from "next/link";
import {
  AudienceBand,
  FeatureGrid,
  MarketCrossLinks,
  MarketingHero,
  MarketingShell,
  PricingCta,
  TranslationDemo,
} from "@/components/marketing";
import { getVisitorLang } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Construction Checklists for Contractors with Spanish-Speaking Crews — MonthlyAlerts",
  description:
    "Stop translating your project through text messages. Write the punch list in English; your foreman and subs work it in Spanish — translated automatically. One-time fee per project.",
  keywords: [
    "bilingual construction checklist",
    "Spanish speaking crew app",
    "construction punch list Spanish",
    "contractor crew communication",
    "English Spanish construction app",
    "remodeling project checklist",
  ],
  alternates: { canonical: "https://www.monthlyalerts.com/for-contractors" },
  openGraph: {
    title: "Checklists your Spanish-speaking crew can read — MonthlyAlerts",
    description:
      "Write the punch list in English. Your crew works it in Spanish — same list, translated automatically.",
    url: "https://www.monthlyalerts.com/for-contractors",
  },
};

export default async function ForContractorsPage() {
  const lang = await getVisitorLang();

  return (
    <MarketingShell lang={lang}>
      <MarketingHero
        kicker="EN ⇄ ES — For remodeling contractors"
        title="Stop translating your project through text messages."
        sub="You write the punch list in English. Your foreman and subs work it in Spanish — the same list, translated automatically, on any phone."
      />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">Type it once. Everyone reads it.</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              The homeowner reads English. Your crew reads Spanish. Today that means you
              re-typing every instruction into a group text and hoping nothing gets lost
              between languages.
            </p>
            <p className="text-sm text-ink-soft leading-relaxed">
              On MonthlyAlerts you add each item to the project checklist once, in your
              language. Every member — homeowner, foreman, sub, inspector — sees it in
              theirs, along with every comment and photo caption.
            </p>
          </div>
          <TranslationDemo
            label="You type it — your crew sees it instantly"
            rows={[
              {
                code: "EN",
                text: "Install outlets on both sides of the kitchen island before drywall.",
              },
              {
                code: "ES",
                text: "Instalar tomacorrientes a ambos lados de la isla de cocina antes de instalar los paneles de yeso.",
              },
            ]}
          />
        </div>
      </section>

      <FeatureGrid
        features={[
          {
            title: "No more group-text telephone",
            body: "Items, comments, due dates, and photo captions are translated for each member automatically. Nobody re-types anything, and nothing gets lost between English and Spanish.",
          },
          {
            title: "Templates for your trade",
            body: "Kitchen and bath remodels, painting, roofing, landscaping, full renovations — start every job from a phase-by-phase checklist and adjust it to the site.",
          },
          {
            title: "The homeowner stays informed",
            body: "Every member gets a monthly status email in their language: what got done, what's new, what's overdue. Fewer check-in calls, fewer surprises.",
          },
        ]}
      />

      <AudienceBand
        title="Built for residential crews"
        items={[
          "General contractors",
          "Kitchen & bath remodelers",
          "Landscapers",
          "Painting contractors",
          "Tile contractors",
          "Roofing contractors",
          "Design/build firms",
          "Construction managers",
        ]}
        note="MonthlyAlerts is made for companies running ten to a hundred residential projects a year — not enterprise construction software. If your project management currently lives in text messages, this is for you."
      />

      <PricingCta blurb="One-time fee when you create a project — no subscription, no per-seat charges. Unlimited checklist items and photos, and your whole crew of subs and inspectors joins free, each in their own language." />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
          Remodeling your own place abroad, or working with international clients? See{" "}
          <Link href="/renovating-in-italy" className="underline hover:text-ink">
            renovating in Italy
          </Link>{" "}
          and{" "}
          <Link href="/for-designers" className="underline hover:text-ink">
            MonthlyAlerts for designers and architects
          </Link>
          .
        </p>
      </section>

      <MarketCrossLinks current="/for-contractors" />
    </MarketingShell>
  );
}
