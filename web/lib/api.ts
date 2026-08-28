import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import { canEdit, getMembership, getProject, type Project, type Role } from "@/lib/projects";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Auth guard for API routes. Returns the user or a ready 401 response. */
export async function requireUser(): Promise<
  { user: SessionUser } | { response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) return { response: jsonError("Unauthorized", 401) };
  return { user };
}

/**
 * Guard for project-scoped routes: authenticates, checks membership at the
 * required level, and (for writes) rejects archived projects.
 */
export async function requireProject(
  projectId: string,
  minRole: "commenter" | "editor" | "owner",
  opts: { write?: boolean } = {}
): Promise<
  | { user: SessionUser; role: Role; project: Project }
  | { response: NextResponse }
> {
  const auth = await requireUser();
  if ("response" in auth) return auth;
  const [role, project] = await Promise.all([
    getMembership(projectId, auth.user.id),
    getProject(projectId),
  ]);
  if (!role || !project) return { response: jsonError("Not found", 404) };
  if (minRole === "owner" && role !== "owner") {
    return { response: jsonError("Forbidden", 403) };
  }
  if (minRole === "editor" && !canEdit(role)) {
    return { response: jsonError("Forbidden", 403) };
  }
  if (opts.write && project.archived_at) {
    return { response: jsonError("Project is archived", 409) };
  }
  return { user: auth.user, role, project };
}

/** Guard for Vercel cron endpoints (Authorization: Bearer CRON_SECRET). */
export function requireCronSecret(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return jsonError("Unauthorized", 401);
  }
  return null;
}
