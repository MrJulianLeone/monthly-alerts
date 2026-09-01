import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { createProspect } from "@/lib/prospecting";

/**
 * Quick-add prospects, one per line: "Company", "Company | website", or a
 * bare website URL (company name derived from the domain). Admin-only.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => null);
  const lines = typeof body?.lines === "string" ? body.lines.split("\n") : [];
  if (lines.length === 0) return jsonError("Nothing to add");

  let added = 0;
  const skipped: string[] = [];
  for (const rawLine of lines.slice(0, 200)) {
    const line = rawLine.trim();
    if (!line) continue;
    let company = "";
    let website: string | null = null;
    if (line.includes("|")) {
      const [c, w] = line.split("|").map((s: string) => s.trim());
      company = c;
      website = w || null;
    } else if (/^(https?:\/\/)?[a-z0-9.-]+\.[a-z]{2,}(\/\S*)?$/i.test(line) && !line.includes(" ")) {
      website = line;
      company = line
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .split(".")[0]
        .replace(/[-_]/g, " ");
    } else {
      company = line;
    }
    if (!company) continue;
    const result = await createProspect({ source: "manual", company, website });
    if ("id" in result) added++;
    else skipped.push(`${company}: ${result.skipped}`);
  }
  return NextResponse.json({ added, skipped });
}
