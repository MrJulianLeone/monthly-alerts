import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

async function sectionProject(id: string): Promise<string | null> {
  const rows = (await sql()`
    SELECT project_id FROM sections WHERE id = ${id}
  `) as { project_id: string }[];
  return rows[0]?.project_id ?? null;
}

/** Parses a money field: number → rounded value, null → clear, absent → keep. */
function money(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.min(999_999_999_999, value).toFixed(2);
  }
  return undefined;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = await sectionProject(id);
  if (!projectId) return jsonError("Not found", 404);
  const body = await request.json().catch(() => ({}));

  const budget = money(body.budget);
  const actual = money(body.actual);
  const touchesMoney = "budget" in body || "actual" in body;

  // Budget and actual are owner-only; renaming is open to editors.
  const auth = await requireProject(projectId, touchesMoney ? "owner" : "editor", {
    write: true,
  });
  if ("response" in auth) return auth.response;

  if (touchesMoney) {
    await sql()`
      UPDATE sections SET
        budget = CASE WHEN ${budget !== undefined}::boolean THEN ${budget ?? null}::numeric ELSE budget END,
        actual = CASE WHEN ${actual !== undefined}::boolean THEN ${actual ?? null}::numeric ELSE actual END
      WHERE id = ${id}
    `;
    return NextResponse.json({ ok: true });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  if (!name) return jsonError("Section name is required", 400);
  await sql()`
    UPDATE sections
    SET name = ${name}, name_lang = ${auth.user.preferred_language}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = await sectionProject(id);
  if (!projectId) return jsonError("Not found", 404);
  const auth = await requireProject(projectId, "owner", { write: true });
  if ("response" in auth) return auth.response;
  await sql()`DELETE FROM sections WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
