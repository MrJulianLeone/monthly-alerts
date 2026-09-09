import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/api";
import { sql } from "@/lib/db";
import { sendDraftExpiringEmail, sendExpiryWarningEmail } from "@/lib/email";
import { deleteProjectBlobs } from "@/lib/files";
import { locale, type Lang } from "@/lib/i18n";
import { PROJECT_RETENTION_YEARS, projectExpiresAt } from "@/lib/projects";
import { translateOne } from "@/lib/translate";

export const maxDuration = 300;

/**
 * Daily storage-retention sweep (vercel.json), in four phases:
 *   0. Drafts (billing on, never activated): remind the owner 3 days before
 *      the draft deadline, then delete drafts past it.
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

  // Phase 0: drafts.
  const draftsEnding = (await sql()`
    SELECT p.id, p.name, p.name_lang, p.draft_expires_at,
           u.email AS owner_email, u.preferred_language AS owner_lang
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.paid_at IS NULL AND p.draft_expires_at IS NOT NULL AND p.draft_warned_at IS NULL
      AND u.deleted_at IS NULL AND u.email_opt_out = false
      AND p.draft_expires_at BETWEEN now() AND now() + interval '3 days'
  `) as {
    id: string;
    name: string;
    name_lang: Lang;
    draft_expires_at: string;
    owner_email: string;
    owner_lang: Lang;
  }[];
  let draftsWarned = 0;
  for (const draft of draftsEnding) {
    try {
      const name = await translateOne(draft.name, draft.name_lang, draft.owner_lang);
      const days = Math.max(
        1,
        Math.ceil((new Date(draft.draft_expires_at).getTime() - Date.now()) / 86_400_000)
      );
      await sendDraftExpiringEmail(draft.owner_email, draft.owner_lang, {
        projectName: name,
        projectId: draft.id,
        days,
      });
      await sql()`UPDATE projects SET draft_warned_at = now() WHERE id = ${draft.id}`;
      draftsWarned++;
    } catch (err) {
      console.error(`expire-projects: draft reminder for ${draft.id} failed:`, err);
    }
  }

  const expiredDrafts = (await sql()`
    SELECT id, name FROM projects
    WHERE paid_at IS NULL AND draft_expires_at IS NOT NULL AND draft_expires_at < now()
  `) as { id: string; name: string }[];
  let draftsDeleted = 0;
  for (const draft of expiredDrafts) {
    await deleteProjectBlobs(draft.id);
    await sql()`DELETE FROM projects WHERE id = ${draft.id}`;
    draftsDeleted++;
    console.log(`expire-projects: deleted unactivated draft "${draft.name}" (${draft.id})`);
  }

  // Phase 1: 30-day warnings.
  const expiring = (await sql()`
    SELECT p.id, p.name, p.name_lang, p.paid_at, p.created_at, p.extended_years,
           u.email AS owner_email, u.preferred_language AS owner_lang
    FROM projects p JOIN users u ON u.id = p.owner_id
    WHERE p.expiry_warned_at IS NULL
      AND (p.paid_at IS NOT NULL OR p.draft_expires_at IS NULL)
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
    drafts_warned: draftsWarned,
    drafts_deleted: draftsDeleted,
    warned,
    deleted: expired.length,
    blobs_deleted: blobsDeleted,
  });
}
