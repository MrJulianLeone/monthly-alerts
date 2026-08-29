import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { jsonError, requireUser } from "@/lib/api";
import { deleteThread, setThreadFolder } from "@/lib/support";

// Admin-only thread management: move between inbox/spam, delete permanently.

async function requireAdmin() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;
  if (!isAdmin(auth.user)) return jsonError("Not found", 404);
  return null;
}

/** Move a thread: body {key, folder: 'inbox' | 'spam'}. */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const folder = body?.folder;
  if (!key || (folder !== "inbox" && folder !== "spam")) {
    return jsonError("key and folder ('inbox' | 'spam') required");
  }
  await setThreadFolder(key, folder);
  return NextResponse.json({ ok: true });
}

/** Permanently delete a thread and all its messages: body {key}. */
export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  if (!key) return jsonError("key required");
  const deleted = await deleteThread(key);
  return NextResponse.json({ ok: true, deleted });
}
