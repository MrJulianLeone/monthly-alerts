import { NextResponse } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api";
import { sql } from "@/lib/db";
import { getProspect, setStatus, suppress } from "@/lib/prospecting";

/**
 * Per-prospect admin actions. PATCH body: {action, ...fields}:
 *  - save_drafts: {draft_subject, draft_body, followup_subject, followup_body}
 *  - approve: queue for sending (drafts must exist; pending_approval only)
 *  - unapprove: back to pending_approval before it sends
 *  - reject: close without contacting
 *  - suppress: close AND permanently do-not-contact the email
 *  - retry: re-run enrichment from scratch (parked prospects)
 *  - set_contact: {email?, website?, contact_name?} manual fixes, re-enters
 *    the pipeline at the right stage
 */
export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const { id } = await ctx.params;
  const prospect = await getProspect(id);
  if (!prospect) return jsonError("Not found", 404);

  const body = await request.json().catch(() => ({}));
  const action = typeof body?.action === "string" ? body.action : "";

  switch (action) {
    case "save_drafts": {
      const s = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);
      await sql()`
        UPDATE prospects
        SET draft_subject = ${s(body.draft_subject)}, draft_body = ${s(body.draft_body)},
            followup_subject = ${s(body.followup_subject)}, followup_body = ${s(body.followup_body)},
            updated_at = now()
        WHERE id = ${id}
      `;
      break;
    }
    case "approve": {
      if (prospect.status !== "pending_approval") {
        return jsonError(`Cannot approve from status "${prospect.status}"`);
      }
      if (!prospect.email) return jsonError("Prospect has no email");
      if (!prospect.draft_subject || !prospect.draft_body) {
        return jsonError("Drafts are missing");
      }
      await sql()`
        UPDATE prospects SET status = 'approved', approved_at = now(), updated_at = now()
        WHERE id = ${id}
      `;
      break;
    }
    case "unapprove": {
      if (prospect.status !== "approved") return jsonError("Not in the send queue");
      await sql()`
        UPDATE prospects
        SET status = 'pending_approval', approved_at = NULL, updated_at = now()
        WHERE id = ${id}
      `;
      break;
    }
    case "reject":
      await setStatus(id, "closed", typeof body.note === "string" ? body.note : "Rejected by admin");
      break;
    case "suppress": {
      if (prospect.email) await suppress(prospect.email, "manual");
      await setStatus(id, "suppressed", "Suppressed by admin");
      break;
    }
    case "retry": {
      await sql()`
        UPDATE prospects
        SET status = 'new', status_note = NULL, updated_at = now()
        WHERE id = ${id}
      `;
      break;
    }
    case "set_contact": {
      const email =
        typeof body.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())
          ? body.email.trim().toLowerCase()
          : null;
      const website = typeof body.website === "string" && body.website.trim() !== "" ? body.website.trim() : null;
      const contactName =
        typeof body.contact_name === "string" && body.contact_name.trim() !== ""
          ? body.contact_name.trim()
          : null;
      // A manual email on an un-researched prospect skips straight to
      // research-done; a manual website re-runs enrichment.
      const nextStatus =
        email && ["new", "no_website", "no_email"].includes(prospect.status)
          ? "researched"
          : website && ["no_website", "no_email"].includes(prospect.status)
            ? "new"
            : prospect.status;
      await sql()`
        UPDATE prospects
        SET email = COALESCE(${email}, email),
            website = COALESCE(${website}, website),
            contact_name = COALESCE(${contactName}, contact_name),
            status = ${nextStatus}, status_note = NULL, updated_at = now()
        WHERE id = ${id}
      `;
      break;
    }
    default:
      return jsonError("Unknown action");
  }

  return NextResponse.json({ ok: true, prospect: await getProspect(id) });
}

/** Deletes a prospect entirely (visits and emails cascade). Admin-only. */
export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const { id } = await ctx.params;
  await sql()`DELETE FROM prospects WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
