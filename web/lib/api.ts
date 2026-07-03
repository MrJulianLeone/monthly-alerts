import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Auth guard for API routes. Returns the user or a ready 401 response. */
export async function requireUser(
  request: Request
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const user = await getCurrentUser(request);
  if (!user) return { response: jsonError("Unauthorized", 401) };
  return { user };
}

export async function requireRole(
  request: Request,
  role: "parent" | "admin"
): Promise<{ user: SessionUser } | { response: NextResponse }> {
  const result = await requireUser(request);
  if ("response" in result) return result;
  if (result.user.role !== role && result.user.role !== "admin") {
    return { response: jsonError("Forbidden", 403) };
  }
  return result;
}

/** Guard for Vercel cron endpoints (Authorization: Bearer CRON_SECRET). */
export function requireCronSecret(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }
  return null;
}
