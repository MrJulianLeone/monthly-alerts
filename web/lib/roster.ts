import { sql } from "@/lib/db";
import { createProspect } from "@/lib/prospecting";

// State contractor-license roster ingestion. Rosters arrive as CSV (pasted,
// uploaded as text, or fetched from a URL like the CSLB data portal or
// Washington's Socrata export), get staged into roster_candidates with
// column-mapping heuristics, and are promoted into prospects after the admin
// filters them (classification / geography / license age).

export type RosterFilters = {
  classification_like?: string;
  city_like?: string;
  region?: string;
  issued_after?: string; // ISO date
  active_only?: boolean;
};

const MAX_STAGED_PER_IMPORT = 20_000;

/** Minimal CSV parser: quoted fields, embedded commas/newlines, CRLF. */
export function parseCsv(text: string, maxRows: number): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((f) => f.trim() !== "")) rows.push(row);
      row = [];
      if (rows.length > maxRows) return rows;
    } else {
      field += c;
    }
  }
  row.push(field);
  if (row.some((f) => f.trim() !== "")) rows.push(row);
  return rows;
}

type ColumnMap = {
  company: number;
  city: number;
  region: number;
  phone: number;
  classification: number;
  license_no: number;
  issued: number;
  status: number;
};

/** Best-effort header mapping across state roster formats (-1 = absent). */
export function mapColumns(headers: string[]): ColumnMap {
  const norm = headers.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  const find = (...patterns: RegExp[]): number => {
    for (const p of patterns) {
      const i = norm.findIndex((h) => p.test(h));
      if (i >= 0) return i;
    }
    return -1;
  };
  return {
    company: find(/^business(name)?$/, /businessname|companyname|firmname|entityname|dbaname/, /^company$/, /^name$/),
    city: find(/^city$/, /mailingcity|city/),
    region: find(/^state$/, /^mailingstate$/, /(?<!e)state(?!ment)/),
    phone: find(/^phone/, /phone|telephone/),
    classification: find(/^classification/, /class|specialty|licensetype|worktype/),
    license_no: find(/^licenseno$/, /^license(number|num|no)?$/, /licenseno|licensenumber|licnum|registrationno|certno/),
    issued: find(/issuedate|originalissue|firstissue|effectivedate|registrationdate/, /issue/),
    status: find(/^status$/, /licensestatus|status/),
  };
}

function cell(row: string[], i: number): string | null {
  if (i < 0) return null;
  const v = (row[i] ?? "").trim();
  return v === "" ? null : v;
}

function parseDate(v: string | null): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function matches(f: RosterFilters, c: {
  classification: string | null;
  city: string | null;
  region: string | null;
  issued: string | null;
  status: string | null;
}): boolean {
  if (f.classification_like) {
    const wanted = f.classification_like.toLowerCase().split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const have = (c.classification ?? "").toLowerCase();
    if (wanted.length > 0 && !wanted.some((w) => have.includes(w))) return false;
  }
  if (f.city_like) {
    const wanted = f.city_like.toLowerCase().split(/[,;]/).map((s) => s.trim()).filter(Boolean);
    const have = (c.city ?? "").toLowerCase();
    if (wanted.length > 0 && !wanted.some((w) => have.includes(w))) return false;
  }
  if (f.region && (c.region ?? "").toLowerCase() !== f.region.toLowerCase()) return false;
  if (f.issued_after && (!c.issued || c.issued < f.issued_after)) return false;
  if (f.active_only) {
    const s = (c.status ?? "").toLowerCase();
    if (s && !/active|current|clear|valid/.test(s)) return false;
  }
  return true;
}

export type ImportResult = {
  source: string;
  parsed_rows: number;
  staged: number;
  skipped_filter: number;
  skipped_dupe: number;
  columns: Record<string, string | null>;
};

/** Parses roster CSV text and stages matching rows into roster_candidates. */
export async function importRoster(
  source: string,
  csv: string,
  filters: RosterFilters
): Promise<ImportResult> {
  const rows = parseCsv(csv, 500_000);
  if (rows.length < 2) throw new Error("CSV has no data rows");
  const headers = rows[0];
  const map = mapColumns(headers);
  if (map.company < 0) {
    throw new Error(
      `Could not find a business-name column. Headers seen: ${headers.slice(0, 20).join(", ")}`
    );
  }

  let staged = 0;
  let skippedFilter = 0;
  let skippedDupe = 0;
  let batch: {
    company: string;
    city: string | null;
    region: string | null;
    phone: string | null;
    classification: string | null;
    license_no: string | null;
    license_issued: string | null;
    license_status: string | null;
    raw: Record<string, string>;
  }[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const inserted = (await sql()`
      INSERT INTO roster_candidates (source, company, city, region, phone, classification,
                                     license_no, license_issued, license_status, raw)
      SELECT ${source}, r.company, r.city, r.region, r.phone, r.classification,
             r.license_no, r.license_issued::date, r.license_status, r.raw
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
        AS r(company text, city text, region text, phone text, classification text,
             license_no text, license_issued text, license_status text, raw jsonb)
      ON CONFLICT (source, company, license_no) DO NOTHING
      RETURNING id
    `) as unknown[];
    staged += inserted.length;
    skippedDupe += batch.length - inserted.length;
    batch = [];
  };

  for (let i = 1; i < rows.length; i++) {
    if (staged + batch.length >= MAX_STAGED_PER_IMPORT) break;
    const row = rows[i];
    const company = cell(row, map.company);
    if (!company) continue;
    const candidate = {
      classification: cell(row, map.classification),
      city: cell(row, map.city),
      region: cell(row, map.region),
      issued: parseDate(cell(row, map.issued)),
      status: cell(row, map.status),
    };
    if (!matches(filters, candidate)) {
      skippedFilter++;
      continue;
    }
    const raw: Record<string, string> = {};
    headers.forEach((h, j) => {
      const v = (row[j] ?? "").trim();
      if (h.trim() && v) raw[h.trim()] = v.slice(0, 500);
    });
    batch.push({
      company,
      city: candidate.city,
      region: candidate.region,
      phone: cell(row, map.phone),
      classification: candidate.classification,
      license_no: cell(row, map.license_no) ?? "",
      license_issued: candidate.issued,
      license_status: candidate.status,
      raw,
    });
    if (batch.length >= 500) await flush();
  }
  await flush();

  const colName = (i: number) => (i >= 0 ? headers[i] : null);
  return {
    source,
    parsed_rows: rows.length - 1,
    staged,
    skipped_filter: skippedFilter,
    skipped_dupe: skippedDupe,
    columns: {
      company: colName(map.company),
      city: colName(map.city),
      region: colName(map.region),
      phone: colName(map.phone),
      classification: colName(map.classification),
      license_no: colName(map.license_no),
      issued: colName(map.issued),
      status: colName(map.status),
    },
  };
}

/**
 * Promotes up to `limit` staged candidates (newest license first) into the
 * prospect pipeline, deduping against prospects, suppressions, and users.
 */
export async function promoteCandidates(
  source: string | null,
  limit: number
): Promise<{ promoted: number; skipped: number }> {
  const rows = (await sql()`
    SELECT id, source, company, city, region, phone, classification, license_no,
           license_issued
    FROM roster_candidates
    WHERE promoted_at IS NULL
      AND (${source}::text IS NULL OR source = ${source})
    ORDER BY license_issued DESC NULLS LAST, created_at
    LIMIT ${Math.min(Math.max(limit, 1), 200)}
  `) as {
    id: string;
    source: string;
    company: string;
    city: string | null;
    region: string | null;
    phone: string | null;
    classification: string | null;
    license_no: string | null;
    license_issued: string | null;
  }[];

  let promoted = 0;
  let skipped = 0;
  for (const c of rows) {
    const result = await createProspect({
      source: `roster:${c.source}`,
      company: c.company,
      city: c.city,
      region: c.region,
      phone: c.phone,
      classification: c.classification,
      license_no: c.license_no,
      license_issued: c.license_issued,
    });
    "id" in result ? promoted++ : skipped++;
    await sql()`UPDATE roster_candidates SET promoted_at = now() WHERE id = ${c.id}`;
  }
  return { promoted, skipped };
}

export type RosterSource = {
  source: string;
  total: number;
  pending: number;
  last_import: string;
};

export async function listSources(): Promise<RosterSource[]> {
  return (await sql()`
    SELECT source, count(*)::int AS total,
           count(*) FILTER (WHERE promoted_at IS NULL)::int AS pending,
           max(created_at) AS last_import
    FROM roster_candidates GROUP BY source ORDER BY max(created_at) DESC
  `) as RosterSource[];
}
