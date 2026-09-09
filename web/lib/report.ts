import { sql } from "@/lib/db";
import type { Lang } from "@/lib/i18n";

/**
 * The numbers behind one project's monthly status report — the same
 * aggregates the monthly cron emails, computed on demand for the in-app
 * preview (/projects/[id]/report).
 */
export type ProjectStatus = {
  total_items: number;
  done_items: number;
  completed_this_month: number;
  added_this_month: number;
  overdue_count: number;
  overdue: { title: string; source_lang: Lang }[];
};

export async function projectStatus(projectId: string): Promise<ProjectStatus> {
  const [totals, overdue] = await Promise.all([
    sql()`
      SELECT
        count(*)::int AS total_items,
        count(*) FILTER (WHERE status = 'done')::int AS done_items,
        count(*) FILTER (WHERE completed_at >= now() - interval '1 month')::int AS completed_this_month,
        count(*) FILTER (WHERE created_at >= now() - interval '1 month')::int AS added_this_month,
        count(*) FILTER (WHERE status <> 'done' AND due_date < current_date)::int AS overdue_count
      FROM items WHERE project_id = ${projectId}
    ` as unknown as Promise<Omit<ProjectStatus, "overdue">[]>,
    sql()`
      SELECT title, source_lang FROM items
      WHERE project_id = ${projectId} AND status <> 'done' AND due_date < current_date
      ORDER BY due_date LIMIT 5
    ` as unknown as Promise<{ title: string; source_lang: Lang }[]>,
  ]);
  return { ...totals[0], overdue };
}
