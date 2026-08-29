import type { Metadata } from "next";
import {
  FeatureGrid,
  MarketCrossLinks,
  MarketingHero,
  MarketingShell,
  PricingCta,
  TranslationDemo,
} from "@/components/marketing";
import { getVisitorLang } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Keep Track of Everything Your Contractor Promised — MonthlyAlerts",
  description:
    "Your renovation is spread across texts, emails, and WhatsApp — maybe in two languages. Put every promise on one checklist you and your contractor both read in your own language.",
  keywords: [
    "track contractor work",
    "renovation checklist app",
    "my contractor speaks Spanish",
    "manage renovation remotely",
    "contractor promised list",
    "home renovation punch list",
  ],
  alternates: { canonical: "https://www.monthlyalerts.com/for-homeowners" },
  openGraph: {
    title: "Everything your contractor promised, on one list — MonthlyAlerts",
    description:
      "One renovation checklist you and your contractor both read in your own languages — with photos and a monthly status email.",
    url: "https://www.monthlyalerts.com/for-homeowners",
  },
};

const HOOKS = [
  {
    quote: "“My contractor speaks Spanish.”",
    answer:
      "Write items in English; your contractor and crew read them in Spanish — and their updates come back to you in English.",
  },
  {
    quote: "“Our project is spread across texts, emails and WhatsApp.”",
    answer:
      "One checklist holds every task, comment, photo, and due date. When something was agreed, it goes on the list — and stays there.",
  },
  {
    quote: "“I can't keep track of everything my contractor promised.”",
    answer:
      "Every promise becomes a checklist item with a status. Open, in progress, done — you always know which is which.",
  },
  {
    quote: "“I'm managing my renovation remotely.”",
    answer:
      "Photos attached to each item show you what actually got done, and a monthly status email sums up progress without you asking.",
  },
  {
    quote: "“I'm remodeling a house overseas.”",
    answer:
      "English, Italian, and Spanish on one project. Your builder abroad works in their language; you read everything in yours.",
  },
];

export default async function ForHomeownersPage() {
  const lang = await getVisitorLang();

  return (
    <MarketingShell lang={lang}>
      <MarketingHero
        kicker="EN ⇄ IT ⇄ ES — For homeowners"
        title="Everything your contractor promised, on one list."
        sub="Texts, emails, WhatsApp, and a language barrier — that's how renovations get lost. Put every task on one checklist you and your contractor both read in your own languages."
      />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <h2 className="display text-4xl mb-10">Sound familiar?</h2>
          <ul className="space-y-6 max-w-3xl">
            {HOOKS.map((h) => (
              <li key={h.quote} className="flex flex-col sm:flex-row gap-2 sm:gap-6">
                <p className="display text-xl sm:w-72 shrink-0">{h.quote}</p>
                <p className="text-sm text-ink-soft leading-relaxed pt-0.5">{h.answer}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="display text-4xl mb-4">You don't need to speak their language</h2>
          <p className="text-sm text-ink-soft leading-relaxed mb-4">
            Add an item in English. Your contractor sees it in Spanish or Italian the
            moment they open the list — and when they comment or add a photo caption,
            you read it in English.
          </p>
          <p className="text-sm text-ink-soft leading-relaxed">
            No copy-pasting into a translator, no wondering whether the message landed.
          </p>
        </div>
        <TranslationDemo
          label="You write it — your contractor reads it"
          rows={[
            { code: "EN", text: "Please fix the leak under the bathroom sink this week." },
            { code: "ES", text: "Por favor reparar la fuga bajo el lavabo del baño esta semana." },
          ]}
        />
      </section>

      <FeatureGrid
        features={[
          {
            title: "Start from a real checklist",
            body: "Kitchen remodel, bathroom, painting, roofing, landscaping, or a full renovation — pick a phase-by-phase template so nothing gets forgotten between demolition and final inspection.",
          },
          {
            title: "Photos as proof of progress",
            body: "Your contractor attaches photos to items as work happens. Whether you're across town or across an ocean, you see what got done.",
          },
          {
            title: "A monthly summary, automatically",
            body: "On the first of the month, everyone on the project gets a status email in their language: progress, completed work, and what's overdue.",
          },
        ]}
      />

      <PricingCta blurb="One-time fee when you create a project — no subscription. Unlimited checklist items and photos, and your contractor and their whole crew join free, each in their own language." />

      <MarketCrossLinks current="/for-homeowners" />
    </MarketingShell>
  );
}
