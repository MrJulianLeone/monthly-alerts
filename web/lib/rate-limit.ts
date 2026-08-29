import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { jsonError } from "@/lib/api";
import { requestIp } from "@/lib/auth";

/**
 * Fixed-window rate limiter backed by Postgres — no extra infrastructure.
 * Returns a ready 429 response when the caller is over the limit, else null.
 * Windows reset lazily; stale rows are swept by the daily cron.
 */
export async function rateLimited(
  bucket: string,
  max: number,
  windowMinutes: number
): Promise<NextResponse | null> {
  const ip = (await requestIp()) ?? "unknown";
  const key = `${bucket}:${ip}`;
  try {
    const rows = (await sql()`
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(mins => ${windowMinutes})
          THEN 1 ELSE rate_limits.count + 1 END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(mins => ${windowMinutes})
          THEN now() ELSE rate_limits.window_start END
      RETURNING count
    `) as { count: number }[];
    if (rows[0].count > max) {
      return jsonError("too_many", 429);
    }
  } catch (err) {
    // Rate limiting must never take the auth endpoints down with it.
    console.error("rate limit check failed:", err);
  }
  return null;
}
