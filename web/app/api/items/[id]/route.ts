import { NextResponse } from "next/server";
import { jsonError, requireProject } from "@/lib/api";
import { sql } from "@/lib/db";
import { sendAssignmentEmail } from "@/lib/email";
import { locale, type Lang } from "@/lib/i18n";
import { translateBatch } from "@/lib/translate";

type ItemState = {
  project_id: string;
  section_id: string;
  title: string;
  source_lang: Lang;
  assignee_id: string | null;
  due_date: string | null;
};

async function itemState(id: string): Promise<ItemState | null> {
  const rows = (await sql()`
    SELECT project_id, section_id, title, source_lang, assignee_id,
           due_date::text AS due_date
    FROM items WHERE id = ${id}
  `) as ItemState[];
  return rows[0] ?? null;
}

const STATUSES = ["open", "in_progress", "done"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await itemState(id);
  if (!item) return jsonError("Not found", 404);
  const auth = await requireProject(item.project_id, "editor", { write: true });
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  // Reorder within the section.
  if (body.move === "up" || body.move === "down") {
    const siblings = (await sql()`
      SELECT id FROM items WHERE section_id = ${item.section_id}
      ORDER BY position, created_at
    `) as { id: string }[];
    const idx = siblings.findIndex((s) => s.id === id);
    const swap = body.move === "up" ? idx - 1 : idx + 1;
    if (idx !== -1 && swap >= 0 && swap < siblings.length) {
      [siblings[idx], siblings[swap]] = [siblings[swap], siblings[idx]];
      await Promise.all(
        siblings.map(
          (s, i) => sql()`UPDATE items SET position = ${i} WHERE id = ${s.id}`
        )
      );
    }
    return NextResponse.json({ ok: true });
  }

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
      SELECT 1 FROM project_members WHERE project_id = ${item.project_id} AND user_id = ${assigneeId}
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

  // Notify a newly assigned member (not self-assignments), in their language.
  if (assigneeId && assigneeId !== item.assignee_id && assigneeId !== auth.user.id) {
    try {
      const assignees = (await sql()`
        SELECT email, preferred_language FROM users
        WHERE id = ${assigneeId} AND deleted_at IS NULL
      `) as { email: string; preferred_language: Lang }[];
      if (assignees.length > 0) {
        const assignee = assignees[0];
        const [projectName, itemTitle] = await translateBatch(
          [
            { text: auth.project.name, lang: auth.project.name_lang },
            { text: title ?? item.title, lang: textChanged ? auth.user.preferred_language : item.source_lang },
          ],
          assignee.preferred_language
        );
        const due = dueDate ?? (clearDue ? null : item.due_date);
        await sendAssignmentEmail(assignee.email, assignee.preferred_language, {
          assignerName: auth.user.name ?? auth.user.email,
          projectName,
          itemTitle,
          projectId: item.project_id,
          itemId: id,
          dueDate: due
            ? new Intl.DateTimeFormat(locale(assignee.preferred_language), {
                dateStyle: "medium",
              }).format(new Date(`${due}T12:00:00`))
            : null,
        });
      }
    } catch (err) {
      console.error("assignment email failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await itemState(id);
  if (!item) return jsonError("Not found", 404);
  const auth = await requireProject(item.project_id, "owner", { write: true });
  if ("response" in auth) return auth.response;
  await sql()`DELETE FROM items WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
