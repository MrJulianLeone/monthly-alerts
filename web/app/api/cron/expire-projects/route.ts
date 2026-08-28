import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { requireCronSecret } from "@/lib/api";
import { sql } from "@/lib/db";
import { PROJECT_RETENTION_YEARS } from "@/lib/projects";

export const maxDuration = 300;

/**
 * Daily storage-retention sweep (vercel.json). Projects are kept for two
 * years from payment (creation date for free projects) — a policy disclosed
 * on the site before checkout — then deleted here along with their photos in
 * Blob storage. The DB rows cascade from the projects delete.
 */
export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const expired = (await sql()`
    SELECT id, name FROM projects
    WHERE COALESCE(paid_at, created_at) < now() - make_interval(years => ${PROJECT_RETENTION_YEARS})
  `) as { id: string; name: string }[];

  let photosDeleted = 0;
  for (const project of expired) {
    const photos = (await sql()`
      SELECT url FROM photos WHERE project_id = ${project.id}
    `) as { url: string }[];
    if (photos.length > 0) {
      await del(photos.map((p) => p.url)).catch((err) =>
        console.error(`expire-projects: blob cleanup failed for ${project.id}:`, err)
      );
      photosDeleted += photos.length;
    }
    await sql()`DELETE FROM projects WHERE id = ${project.id}`;
    console.log(`expire-projects: deleted "${project.name}" (${project.id})`);
  }

  return NextResponse.json({ deleted: expired.length, photos_deleted: photosDeleted });
}
