import { sql } from "@/lib/db";
import type { Lang } from "@/lib/i18n";

export type Role = "owner" | "editor" | "commenter";

export const canComment = (_role: Role) => true;
export const canEdit = (role: Role) => role === "owner" || role === "editor";
export const isOwner = (role: Role) => role === "owner";

export type Project = {
  id: string;
  name: string;
  name_lang: Lang;
  address: string | null;
  description: string | null;
  owner_id: string;
  archived_at: string | null;
  created_at: string;
};

export type Member = {
  user_id: string;
  role: Role;
  name: string | null;
  email: string;
  company: string | null;
  preferred_language: Lang;
};

export type Section = {
  id: string;
  name: string;
  name_lang: Lang;
  position: number;
};

export type Item = {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  source_lang: Lang;
  status: "open" | "in_progress" | "done";
  assignee_id: string | null;
  assignee_name: string | null;
  due_date: string | null;
  position: number;
  created_by: string | null;
  created_by_name: string | null;
  created_at: string;
  comment_count: number;
  photo_count: number;
};

/** The viewer's role on a project, or null if they're not a member. */
export async function getMembership(
  projectId: string,
  userId: string
): Promise<Role | null> {
  const rows = (await sql()`
    SELECT role FROM project_members
    WHERE project_id = ${projectId} AND user_id = ${userId}
  `) as { role: Role }[];
  return rows[0]?.role ?? null;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const rows = (await sql()`
    SELECT id, name, name_lang, address, description, owner_id, archived_at, created_at
    FROM projects WHERE id = ${projectId}
  `) as Project[];
  return rows[0] ?? null;
}

export async function listProjectsForUser(userId: string) {
  return (await sql()`
    SELECT p.id, p.name, p.name_lang, p.address, p.archived_at, p.created_at,
           m.role,
           count(i.id)::int AS total_items,
           count(i.id) FILTER (WHERE i.status = 'done')::int AS done_items
    FROM project_members m
    JOIN projects p ON p.id = m.project_id
    LEFT JOIN items i ON i.project_id = p.id
    WHERE m.user_id = ${userId}
    GROUP BY p.id, m.role
    ORDER BY p.archived_at NULLS FIRST, p.created_at DESC
  `) as (Project & { role: Role; total_items: number; done_items: number })[];
}

export async function listSections(projectId: string): Promise<Section[]> {
  return (await sql()`
    SELECT id, name, name_lang, position FROM sections
    WHERE project_id = ${projectId}
    ORDER BY position, created_at
  `) as Section[];
}

export async function listItems(projectId: string): Promise<Item[]> {
  return (await sql()`
    SELECT i.id, i.section_id, i.title, i.description, i.source_lang, i.status,
           i.assignee_id, a.name AS assignee_name,
           i.due_date::text AS due_date, i.position,
           i.created_by, c.name AS created_by_name, i.created_at,
           (SELECT count(*) FROM comments WHERE item_id = i.id)::int AS comment_count,
           (SELECT count(*) FROM photos WHERE item_id = i.id)::int AS photo_count
    FROM items i
    LEFT JOIN users a ON a.id = i.assignee_id
    LEFT JOIN users c ON c.id = i.created_by
    WHERE i.project_id = ${projectId}
    ORDER BY i.position, i.created_at
  `) as Item[];
}

export async function listMembers(projectId: string): Promise<Member[]> {
  return (await sql()`
    SELECT m.user_id, m.role, u.name, u.email, u.company, u.preferred_language
    FROM project_members m
    JOIN users u ON u.id = m.user_id
    WHERE m.project_id = ${projectId} AND u.deleted_at IS NULL
    ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END, u.name
  `) as Member[];
}
