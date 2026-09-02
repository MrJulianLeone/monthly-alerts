import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

/** Uploaders can delete their own files; owners can delete any. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = (await sql()`
    SELECT project_id, uploaded_by, url FROM project_files WHERE id = ${id}
  `) as { project_id: string; uploaded_by: string | null; url: string }[];
  if (rows.length === 0) return jsonError("Not found", 404);

  const auth = await requireProject(rows[0].project_id, "editor", { write: true });
  if ("response" in auth) return auth.response;
  if (auth.role !== "owner" && auth.user.id !== rows[0].uploaded_by) {
    return jsonError("Forbidden", 403);
  }

  await del(rows[0].url).catch(() => {}); // best-effort; the DB row is the source of truth
  await sql()`DELETE FROM project_files WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
