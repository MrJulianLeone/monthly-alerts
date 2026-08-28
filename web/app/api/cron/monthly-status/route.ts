import { NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/api";
import { unsubscribeSignature } from "@/lib/auth";
import { sql } from "@/lib/db";
import { appUrl, sendMonthlyStatusEmail } from "@/lib/email";
import type { Lang } from "@/lib/i18n";
import { translateBatch } from "@/lib/translate";

export const maxDuration = 300;

/**
 * Runs on the 1st of each month (vercel.json). For every active project, sends
 * each member a status summary of the previous month in their own language.
 * Translations are cached content-addressed, so a project with five Italian
 * members costs one translation, not five.
 */
export async function GET(request: Request) {
  const denied = requireCronSecret(request);
  if (denied) return denied;

  const projects = (await sql()`
    SELECT p.id, p.name, p.name_lang,
      (SELECT count(*) FROM items i WHERE i.project_id = p.id)::int AS total_items,
      (SELECT count(*) FROM items i WHERE i.project_id = p.id AND i.status = 'done')::int AS done_items,
      (SELECT count(*) FROM items i WHERE i.project_id = p.id
        AND i.completed_at >= now() - interval '1 month')::int AS completed_this_month,
      (SELECT count(*) FROM items i WHERE i.project_id = p.id
        AND i.created_at >= now() - interval '1 month')::int AS added_this_month,
      (SELECT count(*) FROM items i WHERE i.project_id = p.id
        AND i.status <> 'done' AND i.due_date < current_date)::int AS overdue_count
    FROM projects p
    WHERE p.archived_at IS NULL
  `) as {
    id: string;
    name: string;
    name_lang: Lang;
    total_items: number;
    done_items: number;
    completed_this_month: number;
    added_this_month: number;
    overdue_count: number;
  }[];

  // Label the month being reported on (the one that just ended).
  const reported = new Date();
  reported.setDate(0); // last day of the previous month

  let sent = 0;
  let failed = 0;

  for (const project of projects) {
    const members = (await sql()`
      SELECT u.id, u.email, u.preferred_language
      FROM project_members m JOIN users u ON u.id = m.user_id
      WHERE m.project_id = ${project.id}
        AND u.deleted_at IS NULL AND u.email_opt_out = false
        AND u.onboarded_at IS NOT NULL
    `) as { id: string; email: string; preferred_language: Lang }[];
    if (members.length === 0) continue;

    const overdue = (await sql()`
      SELECT title, source_lang FROM items
      WHERE project_id = ${project.id} AND status <> 'done' AND due_date < current_date
      ORDER BY due_date LIMIT 5
    `) as { title: string; source_lang: Lang }[];

    for (const member of members) {
      const lang = member.preferred_language;
      try {
        const [projectName, ...overdueTitles] = await translateBatch(
          [
            { text: project.name, lang: project.name_lang },
            ...overdue.map((o) => ({ text: o.title, lang: o.source_lang })),
          ],
          lang
        );
        const monthLabel = new Intl.DateTimeFormat(lang === "it" ? "it-IT" : "en-US", {
          month: "long",
          year: "numeric",
        }).format(reported);
        const unsubscribeUrl = `${appUrl()}/unsubscribe?u=${member.id}&s=${unsubscribeSignature(member.id)}`;
        await sendMonthlyStatusEmail(
          member.email,
          lang,
          {
            projectId: project.id,
            projectName,
            monthLabel,
            totalItems: project.total_items,
            doneItems: project.done_items,
            completedThisMonth: project.completed_this_month,
            addedThisMonth: project.added_this_month,
            overdueCount: project.overdue_count,
            overdueTitles,
          },
          unsubscribeUrl
        );
        sent++;
      } catch (err) {
        failed++;
        console.error(`monthly-status: ${project.id} -> ${member.email} failed:`, err);
      }
    }
  }

  return NextResponse.json({ projects: projects.length, sent, failed });
}
