import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/api";
import { sql } from "@/lib/db";
import { sendExpiryWarningEmail } from "@/lib/email";
import { deleteProjectBlobs } from "@/lib/files";
import { locale, type Lang } from "@/lib/i18n";
import { PROJECT_RETENTION_YEARS, projectExpiresAt } from "@/lib/projects";
import { translateOne } from "@/lib/translate";

export const maxDuration = 300;

/**
 * Daily storage-retention sweep (vercel.json), in three phases:
 *   1. Warn owners of projects entering their final 30 days (once, in their
 *      language, with a print-before-deletion reminder).
 *   2. Delete projects past the two-year retention period — a policy
 *      disclosed on the site before checkout — including Blob photos and files.
 *   3. Housekeeping: sweep expired tokens, sessions, stale invites, and old
 *      rate-limit windows.
 */
export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  // Phase 1: 30-day warnings.
  const expiring = (await sql()`
    SELECT p.id, p.name, p.name_lang, p.paid_at, p.created_at, p.extended_years,
           u.email AS owner_email, u.preferred_language AS owner_lang
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.expiry_warned_at IS NULL
      AND u.deleted_at IS NULL
      AND COALESCE(p.paid_at, p.created_at)
            + make_interval(years => ${PROJECT_RETENTION_YEARS} + p.extended_years)
          BETWEEN now() AND now() + interval '30 days'
  `) as {
    id: string;
    name: string;
    name_lang: Lang;
    paid_at: string | null;
    created_at: string;
    extended_years: number;
    owner_email: string;
    owner_lang: Lang;
  }[];

  let warned = 0;
  for (const project of expiring) {
    try {
      const name = await translateOne(project.name, project.name_lang, project.owner_lang);
      const date = new Intl.DateTimeFormat(locale(project.owner_lang), {
        dateStyle: "long",
      }).format(projectExpiresAt(project));
      await sendExpiryWarningEmail(project.owner_email, project.owner_lang, {
        projectName: name,
        projectId: project.id,
        date,
      });
      await sql()`UPDATE projects SET expiry_warned_at = now() WHERE id = ${project.id}`;
      warned++;
    } catch (err) {
      console.error(`expire-projects: warning for ${project.id} failed:`, err);
    }
  }

  // Phase 2: deletions.
  const expired = (await sql()`
    SELECT id, name FROM projects
    WHERE COALESCE(paid_at, created_at)
          < now() - make_interval(years => ${PROJECT_RETENTION_YEARS} + extended_years)
  `) as { id: string; name: string }[];

  let blobsDeleted = 0;
  for (const project of expired) {
    blobsDeleted += await deleteProjectBlobs(project.id);
    await sql()`DELETE FROM projects WHERE id = ${project.id}`;
    console.log(`expire-projects: deleted "${project.name}" (${project.id})`);
  }

  // Phase 3: housekeeping.
  await sql()`DELETE FROM login_tokens WHERE expires_at < now() - interval '1 day'`;
  await sql()`DELETE FROM sessions WHERE expires_at < now()`;
  await sql()`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`;
  await sql()`
    DELETE FROM invites WHERE accepted_at IS NULL AND expires_at < now() - interval '30 days'
  `;

  return NextResponse.json({
    warned,
    deleted: expired.length,
    blobs_deleted: blobsDeleted,
  });
}
