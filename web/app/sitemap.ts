import type { MetadataRoute } from "next";
import { LANGUAGES } from "@/lib/i18n";
import { SITE_URL, localePath } from "@/lib/seo";

/** Pages that exist in every language (English at the root, others prefixed). */
const LOCALIZED_PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/for-contractors", priority: 0.9 },
  { path: "/renovating-abroad", priority: 0.9 },
  { path: "/for-designers", priority: 0.8 },
  { path: "/for-homeowners", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const localized: MetadataRoute.Sitemap = LOCALIZED_PAGES.flatMap((page) => {
    const languages = Object.fromEntries(
      LANGUAGES.map((l) => [l.code, SITE_URL + localePath(l.code, page.path)])
    );
    return LANGUAGES.map((l) => ({
      url: SITE_URL + localePath(l.code, page.path),
      changeFrequency: "monthly" as const,
      priority: l.code === "en" ? page.priority : page.priority - 0.1,
      alternates: { languages },
    }));
  });

  return [
    ...localized,
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
