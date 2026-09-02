import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import type { FileUsage } from "@/lib/file-limits";

/**
 * Project file cabinet: PDF documents stored in Vercel Blob.
 *
 * Uploads go browser → Blob directly (client upload with a server-issued
 * token), which sidesteps Vercel's 4.5MB request-body limit for PDFs. The
 * limits in lib/file-limits.ts are enforced twice: when the upload token is
 * issued (app/api/projects/[id]/files/upload) and again when the finished
 * upload is registered (app/api/projects/[id]/files).
 */

export type ProjectFile = {
  id: string;
  name: string;
  url: string;
  pathname: string;
  size_bytes: number;
  uploaded_by: string | null;
  uploaded_by_name: string | null;
  created_at: string;
};

export async function listFiles(projectId: string): Promise<ProjectFile[]> {
  return (await sql()`
    SELECT f.id, f.name, f.url, f.pathname, f.size_bytes::int AS size_bytes,
           f.uploaded_by, u.name AS uploaded_by_name, f.created_at
    FROM project_files f
    LEFT JOIN users u ON u.id = f.uploaded_by
    WHERE f.project_id = ${projectId}
    ORDER BY f.created_at DESC, f.name
  `) as ProjectFile[];
}

export async function fileUsage(projectId: string): Promise<FileUsage> {
  const rows = (await sql()`
    SELECT count(*)::int AS count, COALESCE(sum(size_bytes), 0)::text AS bytes
    FROM project_files WHERE project_id = ${projectId}
  `) as { count: number; bytes: string }[];
  return { count: rows[0]?.count ?? 0, bytes: Number(rows[0]?.bytes ?? 0) };
}

/**
 * Remove every Blob object belonging to a project (item photos + cabinet
 * files). Called before the project row is deleted, since ON DELETE CASCADE
 * only clears the database side. Best-effort: the DB rows are the source of
 * truth, and a stray blob costs storage but leaks nothing (URLs are
 * unguessable). Returns the number of blobs requested for deletion.
 */
export async function deleteProjectBlobs(projectId: string): Promise<number> {
  const rows = (await sql()`
    SELECT url FROM photos WHERE project_id = ${projectId}
    UNION ALL
    SELECT url FROM project_files WHERE project_id = ${projectId}
  `) as { url: string }[];
  if (rows.length === 0) return 0;
  await del(rows.map((r) => r.url)).catch((err) =>
    console.error(`blob cleanup failed for project ${projectId}:`, err)
  );
  return rows.length;
}
