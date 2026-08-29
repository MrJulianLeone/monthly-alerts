import { LANGUAGES, type Lang } from "@/lib/i18n";

export const SITE_URL = "https://www.monthlyalerts.com";

/** Locales served under a URL prefix (/it/..., /es/...); English lives at the root. */
export const PREFIX_LOCALES: Lang[] = ["it", "es"];

export function resolvePrefixLocale(value: string): Lang | null {
  return (PREFIX_LOCALES as string[]).includes(value) ? (value as Lang) : null;
}

/** Language-specific URL path for a language-neutral path ("/", "/for-contractors"). */
export function localePath(lang: Lang, path: string): string {
  if (lang === "en") return path;
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** Canonical + hreflang alternates for one language version of an indexable page. */
export function localeAlternates(lang: Lang, path: string) {
  const languages: Record<string, string> = Object.fromEntries(
    LANGUAGES.map((l) => [l.code, SITE_URL + localePath(l.code, path)])
  );
  languages["x-default"] = SITE_URL + path;
  return { canonical: SITE_URL + localePath(lang, path), languages };
}
