/**
 * Static marketing content: SEO guides (/guides/[slug]) and public checklist
 * templates (/checklists/[slug]). English-only by design — template items are
 * inserted with source_lang "en" and translated per viewer like any other
 * content, so one English template serves every language.
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; title: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type Guide = {
  slug: string;
  /** SEO cluster the page belongs to; used for related links. */
  cluster: "italy" | "multilingual" | "remodeling" | "remote";
  title: string; // H1
  metaTitle: string; // <title>, ≤ 60 chars ideally
  metaDesc: string; // ≤ 155 chars
  keywords: string[];
  kicker: string; // small label above the H1
  intro: string; // lead paragraph
  blocks: GuideBlock[];
  faq?: { q: string; a: string }[];
  /** Slug of a checklist template to promote at the end, if relevant. */
  template?: string;
  /** Slugs of related guides (2–4). */
  related?: string[];
  /** Marketing page to link as the primary CTA (e.g. "/renovating-abroad"). */
  cta?: string;
  publishedAt: string; // ISO date
};

export type TemplateItem = { title: string; description?: string };

export type TemplateSection = { name: string; items: TemplateItem[] };

export type ChecklistTemplate = {
  slug: string;
  name: string; // project-name default and H1
  metaTitle: string;
  metaDesc: string;
  keywords: string[];
  kicker: string;
  intro: string;
  /** 2–4 short paragraphs explaining how to use the checklist. */
  howToUse: string[];
  /** Who this is for; shown as a band. */
  audience: string[];
  sections: TemplateSection[];
  faq?: { q: string; a: string }[];
  related?: string[]; // other template slugs
  guides?: string[]; // guide slugs
  cta?: string; // marketing page for the primary CTA
  publishedAt: string;
};
