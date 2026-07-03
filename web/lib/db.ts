import { neon } from "@neondatabase/serverless";

let cached: ReturnType<typeof neon> | null = null;

/** Returns the shared Neon SQL client (tagged-template query function). */
export function sql() {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    cached = neon(url);
  }
  return cached;
}
