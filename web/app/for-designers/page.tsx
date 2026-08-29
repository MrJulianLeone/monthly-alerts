import type { Metadata } from "next";
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
  title: "Project Checklists for Interior Designers & Architects — MonthlyAlerts",
  description:
    "Give every contractor, subcontractor, and client the same project checklist — automatically translated into their language. A monthly summary email keeps clients informed without you writing a word.",
  keywords: [
    "interior designer project management",
    "architect client communication",
    "design project checklist",
    "FF&E procurement tracker",
    "translated project checklist",
    "monthly client report interior design",
  ],
  alternates: { canonical: "https://www.monthlyalerts.com/for-designers" },
  openGraph: {
    title: "One checklist for every trade and every client — MonthlyAlerts",
    description:
      "Contractors, subs, and clients all work the same list, translated automatically — with a monthly summary email you never have to write.",
    url: "https://www.monthlyalerts.com/for-designers",
  },
};

export default async function ForDesignersPage() {
  const lang = await getVisitorLang();

  return (
    <MarketingShell lang={lang}>
      <MarketingHero
        kicker="EN ⇄ IT ⇄ ES — For interior designers & architects"
        title="Give everyone the same checklist — in their own language."
        sub="Contractors, subcontractors, and clients all work one project list, translated automatically. You look organized because you are."
      />

      <section className="border-b-[1.5px] border-line-strong bg-sheet">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="display text-4xl mb-4">
              “You’ll receive a monthly project summary automatically.”
            </h2>
            <p className="text-sm text-ink-soft leading-relaxed mb-4">
              That one sentence wins clients. On the first of every month, each project
              member gets a status email in their language: overall progress, what was
              completed, what was added, and what's overdue — assembled from the
              checklist you're already keeping.
            </p>
            <p className="text-sm text-ink-soft leading-relaxed">
              Client communication is part of your job. This is the part of it you no
              longer have to write.
            </p>
          </div>
          <TranslationDemo
            label="One item, three readers"
            rows={[
              { code: "EN", text: "Confirm the marble slab selection at the stone yard." },
              { code: "IT", text: "Confermare la scelta della lastra di marmo dal marmista." },
              { code: "ES", text: "Confirmar la selección de la placa de mármol en el depósito." },
            ]}
          />
        </div>
      </section>

      <FeatureGrid
        features={[
          {
            title: "Client-safe by design",
            body: "Invite clients as commenters: they see progress, photos, and phases, and can ask questions in the thread — without editing your checklist. Trades join as editors and check work off.",
          },
          {
            title: "From concept to install",
            body: "Start from the interior-design template — concept, approvals, space planning, FF&E, procurement, trades coordination, deliveries, installation, styling, handover — or any construction-trade template.",
          },
          {
            title: "Every trade, every language",
            body: "English, Italian, and Spanish on the same project. Your tile sub reads Spanish, your client reads English, your Milanese furniture maker reads Italian — nobody misses an instruction.",
          },
        ]}
      />

      <AudienceBand
        title="Who uses it"
        items={[
          "Interior designers",
          "Architects",
          "Design/build studios",
          "Kitchen & bath designers",
          "Landscape architects",
          "Project managers",
          "Procurement teams",
          "Staging & styling teams",
        ]}
        note="Per-phase budgets with budget vs. actual, photo documentation with captions, assignees and due dates — organized the way a design project actually runs, and printable when the client wants paper."
      />

      <PricingCta blurb="One-time fee when you create a project — no subscription, no per-seat pricing to pass on to clients. Unlimited items and photos, and every client, contractor, and sub you invite joins free." />

      <MarketCrossLinks current="/for-designers" />
    </MarketingShell>
  );
}
