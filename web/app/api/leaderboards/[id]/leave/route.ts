import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

/** Leave a leaderboard (users can leave any leaderboard at any time). */
export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireUser(request);
  if ("response" in auth) return auth.response;
  const { id } = await params;

  const updated = (await sql()`
    UPDATE leaderboard_members SET left_at = now()
    WHERE leaderboard_id = ${id} AND user_id = ${auth.user.id} AND left_at IS NULL
    RETURNING user_id
  `) as unknown[];
  if (updated.length === 0) return jsonError("Not a member of this leaderboard", 404);

  return NextResponse.json({ ok: true });
}
