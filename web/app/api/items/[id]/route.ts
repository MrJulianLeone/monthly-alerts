import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";

async function itemProject(id: string): Promise<string | null> {
  const rows = (await sql()`
    SELECT project_id FROM items WHERE id = ${id}
  `) as { project_id: string }[];
  return rows[0]?.project_id ?? null;
}

const STATUSES = ["open", "in_progress", "done"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = await itemProject(id);
  if (!projectId) return jsonError("Not found", 404);
  const auth = await requireProject(projectId, "editor", { write: true });
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  // Text changes: the edited version becomes the new source, in the editor's
  // language (they were editing the text as displayed to them).
  const title =
    typeof body.title === "string" && body.title.trim() !== ""
      ? body.title.trim().slice(0, 300)
      : null;
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 4000) : null;
  const textChanged = title !== null || description !== null;

  const status = STATUSES.includes(body.status) ? (body.status as string) : null;
  const dueDate =
    typeof body.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date)
      ? body.due_date
      : null;
  const clearDue = body.due_date === null && "due_date" in body;
  const assigneeId = typeof body.assignee_id === "string" ? body.assignee_id : null;
  const clearAssignee = body.assignee_id === null && "assignee_id" in body;

  if (assigneeId) {
    const member = (await sql()`
      SELECT 1 FROM project_members WHERE project_id = ${projectId} AND user_id = ${assigneeId}
    `) as unknown[];
    if (member.length === 0) return jsonError("Assignee is not a project member", 400);
  }

  await sql()`
    UPDATE items SET
      title = COALESCE(${title}::text, title),
      description = CASE WHEN ${description}::text IS NULL THEN description
                         WHEN ${description}::text = '' THEN NULL
                         ELSE ${description}::text END,
      source_lang = CASE WHEN ${textChanged}::boolean THEN ${auth.user.preferred_language}::text ELSE source_lang END,
      status = COALESCE(${status}::text, status),
      completed_at = CASE WHEN ${status}::text = 'done' THEN COALESCE(completed_at, now())
                          WHEN ${status}::text IS NOT NULL THEN NULL
                          ELSE completed_at END,
      completed_by = CASE WHEN ${status}::text = 'done' THEN COALESCE(completed_by, ${auth.user.id}::uuid)
                          WHEN ${status}::text IS NOT NULL THEN NULL
                          ELSE completed_by END,
      due_date = CASE WHEN ${clearDue}::boolean THEN NULL ELSE COALESCE(${dueDate}::date, due_date) END,
      assignee_id = CASE WHEN ${clearAssignee}::boolean THEN NULL ELSE COALESCE(${assigneeId}::uuid, assignee_id) END,
      updated_at = now()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = await itemProject(id);
  if (!projectId) return jsonError("Not found", 404);
  const auth = await requireProject(projectId, "owner", { write: true });
  if ("response" in auth) return auth.response;
  await sql()`DELETE FROM items WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
