import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = (await sql()`
    SELECT project_id FROM items WHERE id = ${id}
  `) as { project_id: string }[];
  if (rows.length === 0) return jsonError("Not found", 404);
  const projectId = rows[0].project_id;
  const auth = await requireProject(projectId, "editor", { write: true });
  if ("response" in auth) return auth.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("No file", 400);
  const ext = TYPES[file.type];
  if (!ext) return jsonError("Unsupported image type", 415);
  if (file.size > MAX_BYTES) return jsonError("Image too large (max 8MB)", 413);

  const pathname = `projects/${projectId}/items/${id}/${randomUUID()}.${ext}`;
  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type,
  });

  const inserted = (await sql()`
    INSERT INTO photos (item_id, project_id, url, pathname, content_type, size_bytes, uploaded_by)
    VALUES (${id}, ${projectId}, ${blob.url}, ${blob.pathname}, ${file.type},
            ${file.size}, ${auth.user.id})
    RETURNING id, url
  `) as { id: string; url: string }[];
  return NextResponse.json(inserted[0]);
}
