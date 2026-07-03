import { sql } from "@/lib/db";

/**
 * Records an analytics event with IP-based geolocation for the admin
 * dashboard. Geolocation comes from Vercel's edge headers (no external API).
 * Best-effort: analytics must never break a user-facing request.
 */
export async function trackEvent(
  request: Request,
  event: string,
  userId?: string | null,
  path?: string
): Promise<void> {
  try {
    const h = request.headers;
    const ip =
      h.get("x-forwarded-for")?.split(",")[0].trim() ?? h.get("x-real-ip");
    await sql()`
      INSERT INTO analytics_events (user_id, event, path, ip, country, region, city, user_agent)
      VALUES (
        ${userId ?? null}, ${event}, ${path ?? new URL(request.url).pathname},
        ${ip ?? null},
        ${h.get("x-vercel-ip-country")},
        ${h.get("x-vercel-ip-country-region")},
        ${h.get("x-vercel-ip-city") ? decodeURIComponent(h.get("x-vercel-ip-city")!) : null},
        ${h.get("user-agent")}
      )
    `;
  } catch {
    // ignore
  }
}
