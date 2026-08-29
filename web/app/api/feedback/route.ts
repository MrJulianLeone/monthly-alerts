import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/admin";
import { jsonError, requireUser } from "@/lib/api";
import { appUrl, escapeHtml, sendRawEmail } from "@/lib/email";
import { sql } from "@/lib/db";
import { rateLimited } from "@/lib/rate-limit";
import { resolveThreadKey, supportAddress, supportFrom, type SupportMessage } from "@/lib/support";

/**
 * In-app feedback from signed-in users: recorded in the support inbox
 * (threaded per user) and emailed to the admin. Trusted senders — no AI
 * triage, no auto-reply.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const limited = await rateLimited("feedback", 10, 60);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim().slice(0, 8000) : "";
  if (!message) return jsonError("Message required");

  const email = auth.user.email;
  const subject = "App feedback";
  const threadKey = (await resolveThreadKey(email, subject, null)) ?? crypto.randomUUID();

  const rows = (await sql()`
    INSERT INTO support_messages
      (direction, thread_key, counterparty_email, from_email, from_name,
       to_email, subject, text_body, ai_verdict, ai_note)
    VALUES
      ('inbound', ${threadKey}, ${email}, ${email}, ${auth.user.name ?? null},
       ${supportAddress()}, ${subject}, ${message},
       'skipped', 'In-app feedback from a signed-in user — not triaged')
    RETURNING *
  `) as SupportMessage[];

  const link = `${appUrl()}/admin/inbox/${encodeURIComponent(rows[0].thread_key)}`;
  const alert = `New in-app feedback.

From: ${auth.user.name ?? ""} <${email}>

--- Feedback ---
${message}

View the thread: ${link}`;
  await sendRawEmail({
    from: supportFrom(),
    to: ADMIN_EMAIL,
    subject: `[Support] Feedback from ${email}`,
    text: alert,
    html: `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1c1917;white-space:pre-wrap">${escapeHtml(alert)}</div>`,
  });

  return NextResponse.json({ ok: true });
}
