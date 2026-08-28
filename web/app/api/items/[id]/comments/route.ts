import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = (await sql()`
    SELECT project_id FROM items WHERE id = ${id}
  `) as { project_id: string }[];
  if (rows.length === 0) return jsonError("Not found", 404);
  // Commenting is the one write every role can do.
  const auth = await requireProject(rows[0].project_id, "commenter", { write: true });
  if ("response" in auth) return auth.response;

  const body = await request.json().catch(() => ({}));
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 4000) : "";
  if (!text) return jsonError("Comment is required", 400);

  const inserted = (await sql()`
    INSERT INTO comments (item_id, author_id, body, source_lang)
    VALUES (${id}, ${auth.user.id}, ${text}, ${auth.user.preferred_language})
    RETURNING id
  `) as { id: string }[];
  return NextResponse.json({ id: inserted[0].id });
}
