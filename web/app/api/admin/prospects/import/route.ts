import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { importRoster, type RosterFilters } from "@/lib/roster";

export const maxDuration = 300;

/**
 * Stages a state license roster into roster_candidates. Accepts CSV text
 * inline (small files — request bodies cap at ~4.5MB on Vercel) or a URL to
 * fetch (large state files). Filters apply during parsing so the staging
 * table only holds rows worth reviewing. Admin-only.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const source = typeof body?.source === "string" && body.source.trim() !== ""
    ? body.source.trim().slice(0, 80)
    : `import-${new Date().toISOString().slice(0, 10)}`;
  const filters: RosterFilters = {
    classification_like: str(body?.classification_like),
    city_like: str(body?.city_like),
    region: str(body?.region),
    issued_after: str(body?.issued_after),
    active_only: body?.active_only !== false,
  };

  let csv: string | null = typeof body?.csv === "string" ? body.csv : null;
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  if (!csv && url) {
    if (!/^https?:\/\//i.test(url)) return jsonError("URL must be http(s)");
    const res = await fetch(url, { redirect: "follow" }).catch(() => null);
    if (!res || !res.ok) return jsonError(`Could not fetch the URL (${res?.status ?? "network error"})`);
    // Cap at ~80MB of text to stay inside function memory.
    csv = (await res.text()).slice(0, 80_000_000);
  }
  if (!csv) return jsonError("Provide csv text or a url");

  try {
    const result = await importRoster(source, csv, filters);
    return NextResponse.json(result);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Import failed");
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}
