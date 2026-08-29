import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { jsonError, requireUser } from "@/lib/api";
import { sendSupportMessage } from "@/lib/support";

/**
 * Sends a message from the support address: a reply when thread_key is given,
 * otherwise a new conversation. Admin-only.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isAdmin(auth.user)) return jsonError("Not found", 404);

  const body = await request.json().catch(() => null);
  const to = typeof body?.to === "string" ? body.to.trim() : "";
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const text = typeof body?.body === "string" ? body.body.trim() : "";
  const threadKey = typeof body?.thread_key === "string" ? body.thread_key : undefined;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return jsonError("Valid recipient required");
  if (!subject) return jsonError("Subject required");
  if (!text) return jsonError("Message required");

  const message = await sendSupportMessage({ to, subject, body: text, threadKey });
  return NextResponse.json({ ok: true, message });
}
