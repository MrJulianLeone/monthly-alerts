import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, PricingCta } from "@/components/marketing";
import { TEMPLATES, templateItemCount } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Free construction checklist templates: kitchen, bathroom, whole house, punch list, Italy — MonthlyAlerts",
  description:
    "Ready-made renovation checklists you can start a project from in one click: kitchen renovation, bathroom remodel, whole-house renovation, contractor punch list, renovation in Italy, and overseas renovation. Every item translated for each member.",
  alternates: { canonical: `${SITE_URL}/checklists` },
};

export default function ChecklistsIndex() {
  return (
    <MarketingShell lang="en" basePath="/checklists" langToggle={false}>
      <section className="grid-paper border-b-[1.5px] border-line-strong">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="microlabel mb-5">Checklist templates</p>
          <h1 className="display text-5xl sm:text-6xl max-w-3xl mb-6">
            Start from a checklist a contractor would actually use.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">
            Phase-by-phase templates with the items people forget. Start a project from one, edit
            anything, and everyone you invite reads it in their own language.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-px bg-line-strong border-[1.5px] border-line-strong">
          {TEMPLATES.map((tpl) => (
            <Link key={tpl.slug} href={`/checklists/${tpl.slug}`} className="bg-sheet p-7 hover:bg-paper transition-colors">
              <p className="microlabel mb-2">
                {tpl.sections.length} phases · {templateItemCount(tpl)} items
              </p>
              <h2 className="display text-2xl mb-2">{tpl.name}</h2>
              <p className="text-sm text-ink-soft leading-relaxed mb-3">{tpl.intro}</p>
              <p className="text-xs text-ink-faint">
                {tpl.sections.slice(0, 5).map((s) => s.name).join(" · ")}
                {tpl.sections.length > 5 ? " · …" : ""}
              </p>
            </Link>
          ))}
        </div>
        <p className="microlabel mt-6">
          Need something else? Describe your project when you create it and AI drafts the phases for you.
        </p>
      </div>

      <PricingCta
        lang="en"
        blurb="Templates are free to start. Activate a project for a one-time fee to invite your team, start monthly reports, and keep it for two years."
      />
    </MarketingShell>
  );
}
