import { neon } from "@neondatabase/serverless";

type SqlTag = (strings: TemplateStringsArray, ...params: unknown[]) => Promise<unknown>;

let cached: SqlTag | null = null;

/**
 * Returns the shared SQL client (tagged-template query function). Production
 * uses the Neon serverless HTTP driver; a localhost DATABASE_URL (local dev)
 * falls back to node-postgres with the same tagged-template interface.
 */
export function sql(): SqlTag {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    cached = /localhost|127\.0\.0\.1/.test(url) ? localPg(url) : (neon(url) as SqlTag);
  }
  return cached;
}

function localPg(url: string): SqlTag {
  // Lazy-required so the pg pool only exists in local dev.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  const pool = new Pool({ connectionString: url });
  return async (strings, ...params) => {
    const text = strings.reduce(
      (acc, part, i) => acc + (i === 0 ? "" : `$${i}`) + part,
      ""
    );
    const result = await pool.query(text, params as unknown[]);
    return result.rows;
  };
}
