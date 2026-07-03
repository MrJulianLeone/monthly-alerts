import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/api";

/** Chat feed (paginated, newest first). Query: ?before=<iso>&limit=<n> */
export async function GET(request: NextRequest) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 100);
  const before = url.searchParams.get("before");

  const messages = (await (before
    ? sql()`
        SELECT id, sender, kind, content, metadata, created_at
        FROM chat_messages
        WHERE user_id = ${auth.user.id} AND created_at < ${before}
        ORDER BY created_at DESC LIMIT ${limit}`
    : sql()`
        SELECT id, sender, kind, content, metadata, created_at
        FROM chat_messages
        WHERE user_id = ${auth.user.id}
        ORDER BY created_at DESC LIMIT ${limit}`)) as Record<string, unknown>[];

  return NextResponse.json({ messages });
}
