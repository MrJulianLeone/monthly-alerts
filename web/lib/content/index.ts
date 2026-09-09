import { ITALY_GUIDES } from "./guides-italy";
import { US_GUIDES } from "./guides-us";
import { TEMPLATES } from "./templates";
import type { ChecklistTemplate, Guide } from "./types";

export type { ChecklistTemplate, Guide, GuideBlock, TemplateSection } from "./types";

export const GUIDES: Guide[] = [...ITALY_GUIDES, ...US_GUIDES];

export const CLUSTER_LABELS: Record<Guide["cluster"], string> = {
  italy: "Renovating in Italy",
  multilingual: "Multilingual job sites",
  remodeling: "Remodeling",
  remote: "Managing a renovation remotely",
};

export function getGuide(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

export function getTemplate(slug: string): ChecklistTemplate | null {
  return TEMPLATES.find((t) => t.slug === slug) ?? null;
}

export function templateItemCount(template: ChecklistTemplate): number {
  return template.sections.reduce((n, s) => n + s.items.length, 0);
}

export function relatedGuides(guide: Guide): Guide[] {
  const explicit = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((g): g is Guide => !!g && g.slug !== guide.slug);
  if (explicit.length >= 2) return explicit.slice(0, 4);
  const sameCluster = GUIDES.filter((g) => g.cluster === guide.cluster && g.slug !== guide.slug);
  return [...explicit, ...sameCluster.filter((g) => !explicit.includes(g))].slice(0, 4);
}

export function guidesForTemplate(template: ChecklistTemplate): Guide[] {
  return (template.guides ?? []).map((slug) => getGuide(slug)).filter((g): g is Guide => !!g);
}

export function templatesForGuide(guide: Guide): ChecklistTemplate[] {
  const primary = guide.template ? getTemplate(guide.template) : null;
  return primary ? [primary] : [];
}

export { TEMPLATES };
