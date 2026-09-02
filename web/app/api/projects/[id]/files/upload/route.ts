import { NextResponse } from "next/server";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { jsonError, requireProject } from "@/lib/api";
import {
  isValidFilePathname,
  limitViolation,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES_PER_PROJECT,
  PDF_CONTENT_TYPE,
} from "@/lib/file-limits";
import { fileUsage } from "@/lib/files";

const TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Issues a short-lived client-upload token for the project file cabinet.
 * The browser (@vercel/blob/client `upload()`) posts
 * {type: "blob.generate-client-token", payload: {pathname, clientPayload}}
 * here, uploads straight to Blob with the token, then registers the finished
 * blob via POST ../files.
 *
 * Deliberately no upload-completed callback: Vercel Blob holds the upload
 * response until that callback has been delivered, which left the browser
 * stuck on "Uploading…" in production. Registration by the browser is the
 * only path, and it re-verifies the stored object before recording it.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    type?: string;
    payload?: { pathname?: unknown; clientPayload?: unknown };
  } | null;
  if (body?.type !== "blob.generate-client-token") return jsonError("Bad request", 400);

  const auth = await requireProject(id, "editor", { write: true });
  if ("response" in auth) return auth.response;

  const pathname = body.payload?.pathname;
  if (typeof pathname !== "string" || !isValidFilePathname(id, pathname)) {
    return jsonError("Invalid file path", 400);
  }
  let declared: { size?: unknown } = {};
  try {
    const raw = body.payload?.clientPayload;
    declared = JSON.parse(typeof raw === "string" ? raw : "{}");
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

  try {
    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: [PDF_CONTENT_TYPE],
      maximumSizeInBytes: Math.min(MAX_FILE_BYTES, MAX_TOTAL_BYTES_PER_PROJECT - usage.bytes),
      addRandomSuffix: false,
      allowOverwrite: false,
      validUntil: Date.now() + TOKEN_TTL_MS,
    });
    return NextResponse.json({ type: "blob.generate-client-token", clientToken });
  } catch (err) {
    console.error("file upload token failed:", err);
    return jsonError("Upload failed", 500);
  }
}
