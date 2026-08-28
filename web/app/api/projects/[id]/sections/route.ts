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

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  if (!name) return jsonError("Section name is required", 400);

  const rows = (await sql()`
    INSERT INTO sections (project_id, name, name_lang, position, created_by)
    VALUES (
      ${id}, ${name}, ${auth.user.preferred_language},
      COALESCE((SELECT max(position) + 1 FROM sections WHERE project_id = ${id}), 0),
      ${auth.user.id}
    )
    RETURNING id
  `) as { id: string }[];
  return NextResponse.json({ id: rows[0].id });
}
