"use client";

import { useEffect } from "react";

/** Corrects the root <html lang> (hardcoded "en" in the root layout) on localized pages. */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
