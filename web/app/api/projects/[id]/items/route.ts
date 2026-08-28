import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "editor", { write: true });
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const sectionId = typeof body.section_id === "string" ? body.section_id : "";
  const title = typeof body.title === "string" ? body.title.trim().slice(0, 300) : "";
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 4000) : null;
  const dueDate =
    typeof body.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date)
      ? body.due_date
      : null;
  if (!title) return jsonError("Title is required", 400);

  const sections = (await sql()`
    SELECT id FROM sections WHERE id = ${sectionId} AND project_id = ${id}
  `) as { id: string }[];
  if (sections.length === 0) return jsonError("Section not found", 404);

  const rows = (await sql()`
    INSERT INTO items (project_id, section_id, title, description, source_lang, due_date, position, created_by)
    VALUES (
      ${id}, ${sectionId}, ${title}, ${description || null},
      ${auth.user.preferred_language}, ${dueDate},
      COALESCE((SELECT max(position) + 1 FROM items WHERE section_id = ${sectionId}), 0),
      ${auth.user.id}
    )
    RETURNING id
  `) as { id: string }[];
  return NextResponse.json({ id: rows[0].id });
}
