import { NextResponse } from "next/server";
import { head } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";
import {
  cleanFilename,
  isValidFilePathname,
  limitViolation,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES_PER_PROJECT,
  PDF_CONTENT_TYPE,
} from "@/lib/file-limits";
import { fileUsage } from "@/lib/files";

/**
 * Client-upload handshake for the project file cabinet (@vercel/blob/client).
 *
 * The browser calls this twice per upload, through the SDK:
 *   1. "blob.generate-client-token": we authenticate, enforce the limits, and
 *      hand back a short-lived token bound to one pathname + PDF content type.
 *   2. "blob.upload-completed" (called by Vercel, signature-verified by the
 *      SDK, production only): we record the file if the browser's own
 *      registration call (POST ../files) didn't beat us to it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body || typeof body !== "object" || !("type" in body)) {
    return jsonError("Bad request", 400);
  }

  // Authorization + limits happen here, outside the SDK callback, so refusals
  // come back as ordinary JSON errors instead of opaque SDK failures.
  let tokenPayload: string | null = null;
  let maximumSizeInBytes = MAX_FILE_BYTES;
  if (body.type === "blob.generate-client-token") {
    const auth = await requireProject(id, "editor", { write: true });
    if ("response" in auth) return auth.response;

    if (!isValidFilePathname(id, body.payload.pathname)) {
      return jsonError("Invalid file path", 400);
    }
    let declared: { name?: unknown; size?: unknown } = {};
    try {
      declared = JSON.parse(body.payload.clientPayload ?? "{}");
    } catch {
      return jsonError("Bad request", 400);
    }
    const size = typeof declared.size === "number" && declared.size > 0 ? declared.size : NaN;
    if (!Number.isFinite(size)) return jsonError("File size is required", 400);

    const usage = await fileUsage(id);
    const violation = limitViolation(usage, size);
    if (violation) {
      return NextResponse.json(
        { error: "Upload not allowed", code: violation },
        { status: violation === "too_large" ? 413 : 409 }
      );
    }
    maximumSizeInBytes = Math.min(MAX_FILE_BYTES, MAX_TOTAL_BYTES_PER_PROJECT - usage.bytes);
    tokenPayload = JSON.stringify({
      projectId: id,
      userId: auth.user.id,
      name: cleanFilename(declared.name),
    });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [PDF_CONTENT_TYPE],
        maximumSizeInBytes,
        addRandomSuffix: false,
        allowOverwrite: false,
        tokenPayload,
      }),
      onUploadCompleted: async ({ blob, tokenPayload: payload }) => {
        if (!payload) return;
        const meta = JSON.parse(payload) as { projectId: string; userId: string; name: string };
        if (meta.projectId !== id || !isValidFilePathname(id, blob.pathname)) return;
        // The browser normally registers first (POST ../files); this is the
        // fallback for a tab closed mid-upload. Unique pathname keeps it idempotent.
        const stored = await head(blob.url);
        await sql()`
          INSERT INTO project_files (project_id, name, url, pathname, content_type, size_bytes, uploaded_by)
          VALUES (${id}, ${meta.name}, ${blob.url}, ${blob.pathname}, ${PDF_CONTENT_TYPE},
                  ${stored.size}, ${meta.userId})
          ON CONFLICT (pathname) DO NOTHING
        `;
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("file upload handshake failed:", err);
    return jsonError("Upload failed", 400);
  }
}
