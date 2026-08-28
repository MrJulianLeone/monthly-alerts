import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

/** Owner changes a member's role (editor <-> commenter). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  if (userId === auth.project.owner_id) return jsonError("Cannot change the owner", 400);

  const body = await request.json().catch(() => ({}));
  const role = body.role === "editor" ? "editor" : body.role === "commenter" ? "commenter" : null;
  if (!role) return jsonError("Invalid role", 400);

  await sql()`
    UPDATE project_members SET role = ${role}
    WHERE project_id = ${id} AND user_id = ${userId}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  const auth = await requireProject(id, "owner");
  if ("response" in auth) return auth.response;
  if (userId === auth.project.owner_id) return jsonError("Cannot remove the owner", 400);

  await sql()`
    DELETE FROM project_members WHERE project_id = ${id} AND user_id = ${userId}
  `;
  return NextResponse.json({ ok: true });
}
