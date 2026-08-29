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
  title: "Renovating a Home in Italy from the US — English–Italian Project Checklists — MonthlyAlerts",
  description:
    "You work in English. Your Italian contractor and geometra work in Italian. Everyone sees the same renovation checklist, translated automatically — with photos, budgets, and a monthly status email.",
  keywords: [
    "renovating a house in Italy",
    "Italian renovation from abroad",
    "managing Italian contractor remotely",
    "English Italian renovation checklist",
    "buying and renovating in Italy",
    "geometra communication",
  ],
  alternates: { canonical: "https://www.monthlyalerts.com/renovating-in-italy" },
  openGraph: {
    title: "Renovating a home in Italy from the United States? — MonthlyAlerts",
    description:
      "Owner works in English. Contractor works in Italian. Everyone sees the same project.",
    url: "https://www.monthlyalerts.com/renovating-in-italy",
  },
};

export default async function RenovatingInItalyPage() {
  const lang = await getVisitorLang();

  return (
    <MarketingShell lang={lang}>
      <MarketingHero
        kicker="EN ⇄ IT — Renovating in Italy"
        title="Renovating a home in Italy from the United States?"
        sub="You work in English. Your contractor works in Italian. Everyone sees the same project — one checklist, translated automatically."
      />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">Six time zones, one list</h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              Running an Italian renovation over WhatsApp and Google Translate means
              instructions garbled in both directions, and decisions buried in chat
              history nobody can find.
            </p>
            <p className="text-sm text-ink-soft leading-relaxed">
              On MonthlyAlerts you write each task in English; your impresa, geometra,
              and artisans read it in Italian — and their questions, comments, and photo
              captions come back to you in English. You wake up to progress you can
              actually read.
            </p>
          </div>
          <TranslationDemo
            label="You write it — your contractor reads it in Italian"
            rows={[
              {
                code: "EN",
                text: "Confirm the window measurements with the carpenter before ordering.",
              },
              {
                code: "IT",
                text: "Confermare le misure delle finestre con il falegname prima di ordinare.",
              },
            ]}
          />
        </div>
      </section>

      <FeatureGrid
        features={[
          {
            title: "Photos are your site visit",
            body: "Your crew attaches photos to checklist items as work happens. You see exactly what got done this week without flying over — and you have a record of it for the next two years.",
          },
          {
            title: "A template made for this",
            body: "Start from the overseas-renovation template: purchase and due diligence, permits and pratiche, structural work, impianti, finishes, utilities, and handover.",
          },
          {
            title: "A monthly report, automatically",
            body: "Every member gets a monthly status email in their own language — progress, completed work, and overdue items. You stay current; your contractor writes nothing extra.",
          },
        ]}
      />

      <AudienceBand
        title="Who uses it"
        items={[
          "Americans buying homes in Italy",
          "Italian-Americans renovating family property",
          "Second-home owners",
          "Property management companies",
          "Architects with international clients",
          "Geometri",
          "Agencies selling Italian property to foreigners",
          "Contractors serving foreign homeowners",
        ]}
        note="Works both ways: Italian professionals invite their American clients and work in Italian while the client reads English. Spanish is supported too — the same project can carry all three languages at once."
      />

      <PricingCta blurb="One-time fee when you create a project — no subscription. Unlimited checklist items and photos, per-phase budgets in euros or dollars, and everyone you invite — contractor, geometra, family — joins free in their own language." />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <p className="text-sm text-ink-soft leading-relaxed max-w-2xl">
          Managing a renovation closer to home? See{" "}
          <Link href="/for-homeowners" className="underline hover:text-ink">
            MonthlyAlerts for homeowners
          </Link>
          .
        </p>
      </section>

      <MarketCrossLinks current="/renovating-in-italy" />
    </MarketingShell>
  );
}
