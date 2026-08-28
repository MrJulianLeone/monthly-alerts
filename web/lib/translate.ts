import { createHash } from "node:crypto";
import OpenAI from "openai";
import { sql } from "@/lib/db";
import { langName, type Lang } from "@/lib/i18n";

let client: OpenAI | null = null;

function openai(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

/**
 * Content-addressed cache key: an edit to the source text produces a new hash,
 * so stale translations are never served and never need invalidating.
 */
export function sourceHash(text: string, lang: Lang): string {
  return createHash("sha256").update(`${lang}\n${text}`).digest("hex");
}

export type Translatable = { text: string; lang: Lang };

/**
 * Translates a batch of user-written strings into the viewer's language.
 * Returns translations in input order. Strategy:
 *   1. strings already in the target language pass through untouched
 *   2. the rest are looked up in the translations cache (one query)
 *   3. cache misses go to gpt-4o-mini in a single batched call, then cached
 * On AI failure the original text is returned — the checklist must stay
 * usable even if translation is briefly down.
 */
export async function translateBatch(
  entries: Translatable[],
  target: Lang
): Promise<string[]> {
  const results: string[] = new Array(entries.length);
  const pending: { index: number; hash: string; text: string; lang: Lang }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const { text, lang } = entries[i];
    if (lang === target || text.trim() === "") {
      results[i] = text;
    } else {
      pending.push({ index: i, hash: sourceHash(text, lang), text, lang });
    }
  }
  if (pending.length === 0) return results;

  const hashes = [...new Set(pending.map((p) => p.hash))];
  const cached = (await sql()`
    SELECT source_hash, translated FROM translations
    WHERE target_lang = ${target} AND source_hash = ANY(${hashes})
  `) as { source_hash: string; translated: string }[];
  const cacheMap = new Map(cached.map((r) => [r.source_hash, r.translated]));

  const misses = pending.filter((p) => !cacheMap.has(p.hash));
  if (misses.length > 0) {
    // Dedupe identical strings before hitting the model.
    const unique = [...new Map(misses.map((m) => [m.hash, m])).values()];
    try {
      const translated = await callTranslator(
        unique.map((u) => ({ text: u.text, lang: u.lang })),
        target
      );
      await Promise.all(
        unique.map((u, i) =>
          sql()`
            INSERT INTO translations (source_hash, target_lang, translated)
            VALUES (${u.hash}, ${target}, ${translated[i]})
            ON CONFLICT (source_hash, target_lang) DO NOTHING
          `.catch(() => {})
        )
      );
      for (let i = 0; i < unique.length; i++) cacheMap.set(unique[i].hash, translated[i]);
    } catch (err) {
      console.error("translation failed, serving source text:", err);
    }
  }

  for (const p of pending) {
    results[p.index] = cacheMap.get(p.hash) ?? p.text;
  }
  return results;
}

async function callTranslator(
  entries: Translatable[],
  target: Lang
): Promise<string[]> {
  const response = await openai().chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You translate construction-site checklist content (task titles, descriptions, comments, section names) into ${langName(
          target
        )}. Use standard professional construction terminology. Preserve numbers, measurements, units, product names, and formatting exactly. Translate only — never add, omit, or explain. Respond as JSON: {"translations": ["...", ...]} with exactly one translation per input, in order.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          target_language: langName(target),
          texts: entries.map((e) => ({ source_language: langName(e.lang), text: e.text })),
        }),
      },
    ],
  });
  const parsed = JSON.parse(response.choices[0].message.content ?? "{}");
  const translations = Array.isArray(parsed.translations) ? parsed.translations : [];
  if (translations.length !== entries.length) {
    throw new Error(
      `translator returned ${translations.length} results for ${entries.length} inputs`
    );
  }
  return translations.map((t: unknown, i: number) =>
    typeof t === "string" && t.trim() !== "" ? t : entries[i].text
  );
}

/** Convenience wrapper for a single string. */
export async function translateOne(
  text: string,
  lang: Lang,
  target: Lang
): Promise<string> {
  const [result] = await translateBatch([{ text, lang }], target);
  return result;
}
