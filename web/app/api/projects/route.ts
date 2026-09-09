import { NextResponse } from "next/server";
import { jsonError, requireUser } from "@/lib/api";
import { readAttribution } from "@/lib/attribution";
import { billingEnabled, DRAFT_DAYS } from "@/lib/billing";
import { getTemplate } from "@/lib/content";
import { applyTemplate } from "@/lib/content/apply";
import { sql } from "@/lib/db";

/** Unactivated drafts a user may hold at once (billing on). */
const MAX_OPEN_DRAFTS = 3;

/**
 * Creates a project. While billing is disabled it is simply free. With
 * billing on it starts as a DRAFT: fully editable for DRAFT_DAYS so the owner
 * can build the checklist, preview every language and the monthly report,
 * and only then activate it (POST /api/projects/[id]/activate). Optionally
 * seeds sections and items from a public checklist template.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  const body = await request.json().catch(() => ({}));

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const address =
    typeof body.address === "string" ? body.address.trim().slice(0, 300) : null;
  const description =
    typeof body.description === "string" ? body.description.trim().slice(0, 2000) : null;
  const templateSlug =
    typeof body.template === "string" && getTemplate(body.template) ? body.template : null;
  if (!name) return jsonError("Project name is required", 400);

  const lang = auth.user.preferred_language;
  const draft = billingEnabled();

  if (draft) {
    const open = (await sql()`
      SELECT count(*)::int AS count FROM projects
      WHERE owner_id = ${auth.user.id} AND paid_at IS NULL AND draft_expires_at IS NOT NULL
    `) as { count: number }[];
    if (open[0].count >= MAX_OPEN_DRAFTS) return jsonError("too_many_drafts", 409);
  }

  // Attribution: the account's first touch wins; otherwise the current cookies.
  const account = (await sql()`
    SELECT referred_by_code, acquisition FROM users WHERE id = ${auth.user.id}
  `) as { referred_by_code: string | null; acquisition: unknown }[];
  const attribution = await readAttribution();
  const referralCode = account[0]?.referred_by_code ?? attribution.referralCode;
  const acquisition = account[0]?.acquisition ?? attribution.acquisition;

  const rows = (await sql()`
    INSERT INTO projects (name, name_lang, address, description, owner_id, draft_expires_at,
                          referral_code, acquisition)
    VALUES (${name}, ${lang}, ${address}, ${description}, ${auth.user.id},
            CASE WHEN ${draft}::boolean THEN now() + make_interval(days => ${DRAFT_DAYS}) ELSE NULL END,
            ${referralCode}, ${acquisition ? JSON.stringify(acquisition) : null}::jsonb)
    RETURNING id
  `) as { id: string }[];
  const id = rows[0].id;
  await sql()`
    INSERT INTO project_members (project_id, user_id, role)
    VALUES (${id}, ${auth.user.id}, 'owner')
  `;

  let seeded = 0;
  if (templateSlug) {
    try {
      seeded = await applyTemplate(id, templateSlug, auth.user.id);
    } catch (err) {
      console.error(`template ${templateSlug} failed for ${id}:`, err);
    }
  }

  return NextResponse.json({ id, draft, template_items: seeded });
}
