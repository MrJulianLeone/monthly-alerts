import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

/** Authors can delete their own comments; owners can delete any. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = (await sql()`
    SELECT c.author_id, i.project_id
    FROM comments c JOIN items i ON i.id = c.item_id
    WHERE c.id = ${id}
  `) as { author_id: string; project_id: string }[];
  if (rows.length === 0) return jsonError("Not found", 404);

  const auth = await requireProject(rows[0].project_id, "commenter");
  if ("response" in auth) return auth.response;
  if (auth.role !== "owner" && auth.user.id !== rows[0].author_id) {
    return jsonError("Forbidden", 403);
  }

  await sql()`DELETE FROM comments WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
