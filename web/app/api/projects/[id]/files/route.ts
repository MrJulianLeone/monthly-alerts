import { NextResponse } from "next/server";
import { del, head } from "@vercel/blob";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";
import {
  cleanFilename,
  isValidFilePathname,
  limitViolation,
  PDF_CONTENT_TYPE,
} from "@/lib/file-limits";
import { fileUsage, listFiles } from "@/lib/files";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "commenter");
  if ("response" in auth) return auth.response;
  const [files, usage] = await Promise.all([listFiles(id), fileUsage(id)]);
  return NextResponse.json({ files, usage });
}

/** Read just the first bytes of a public blob to confirm it really is a PDF. */
async function looksLikePdf(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-7" } });
    if (!res.ok || !res.body) return false;
    const reader = res.body.getReader();
    const { value } = await reader.read();
    await reader.cancel().catch(() => {});
    if (!value) return false;
    return new TextDecoder().decode(value.subarray(0, 5)) === "%PDF-";
  } catch {
    return false;
  }
}

/**
 * Register a finished client upload as a project file. The blob already
 * exists at this point (uploaded straight to Vercel Blob with a token from
 * ../files/upload), so this re-checks everything against the stored object
 * rather than trusting the request: path shape, content type, PDF signature,
 * and the size/count limits. Anything that fails is deleted from Blob.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "editor", { write: true });
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const url = typeof body.url === "string" ? body.url : "";
  if (!url.startsWith("https://")) return jsonError("Blob URL is required", 400);
  const name = cleanFilename(body.name);

  const stored = await head(url).catch(() => null);
  if (!stored) return jsonError("Uploaded file not found", 404);

  const reject = async (message: string, status: number, code?: string) => {
    await del(url).catch(() => {});
    return NextResponse.json({ error: message, code }, { status });
  };

  if (!isValidFilePathname(id, stored.pathname)) {
    return reject("File does not belong to this project", 400);
  }
  if (stored.contentType !== PDF_CONTENT_TYPE || !(await looksLikePdf(stored.url))) {
    return reject("Only PDF files are accepted", 415, "not_pdf");
  }

  // Already registered (a retried registration)? Just refresh the name.
  const existing = (await sql()`
    SELECT id FROM project_files WHERE pathname = ${stored.pathname}
  `) as { id: string }[];
  if (existing.length > 0) {
    await sql()`UPDATE project_files SET name = ${name} WHERE id = ${existing[0].id}`;
    return NextResponse.json({ id: existing[0].id });
  }

  const violation = limitViolation(await fileUsage(id), stored.size);
  if (violation) {
    return reject("Upload not allowed", violation === "too_large" ? 413 : 409, violation);
  }

  const inserted = (await sql()`
    INSERT INTO project_files (project_id, name, url, pathname, content_type, size_bytes, uploaded_by)
    VALUES (${id}, ${name}, ${stored.url}, ${stored.pathname}, ${PDF_CONTENT_TYPE},
            ${stored.size}, ${auth.user.id})
    ON CONFLICT (pathname) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `) as { id: string }[];
  return NextResponse.json({ id: inserted[0].id });
}
