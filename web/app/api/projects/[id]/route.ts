import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  if (typeof body.archived === "boolean") {
    await sql()`
      UPDATE projects
      SET archived_at = CASE WHEN ${body.archived} THEN COALESCE(archived_at, now()) ELSE NULL END
      WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : null;
  const address =
    typeof body.address === "string" ? body.address.trim().slice(0, 300) : null;
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null;
  if (name === "") return jsonError("Project name is required", 400);

  await sql()`
    UPDATE projects SET
      name = COALESCE(${name}::text, name),
      name_lang = CASE WHEN ${name}::text IS NULL THEN name_lang ELSE ${auth.user.preferred_language}::text END,
      address = COALESCE(${address}::text, address),
      description = COALESCE(${description}::text, description)
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  await sql()`DELETE FROM projects WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
