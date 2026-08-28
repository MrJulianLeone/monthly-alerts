import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

/** Revoke a pending invitation (owner only). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = (await sql()`
    SELECT project_id FROM invites WHERE id = ${id} AND accepted_at IS NULL
  `) as { project_id: string }[];
  if (rows.length === 0) return jsonError("Not found", 404);
  const auth = await requireProject(rows[0].project_id, "owner");
  if ("response" in auth) return auth.response;
  await sql()`DELETE FROM invites WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
