/**
 * The one and only admin account. Admin access is intentionally hardcoded to
 * this single email — no environment variable, no promotion path, no other
 * admins allowed, ever. The session layer (lib/auth.ts) also demotes any
 * other account whose database role is somehow set to 'admin'.
 */
export const ADMIN_EMAIL = "julianleone@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  return typeof email === "string" && email.trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * Maps a database role to the role the app actually honors: the sole admin
 * email is always 'admin'; any other account claiming 'admin' is demoted.
 */
export function effectiveRole(
  email: string | null | undefined,
  dbRole: string
): "user" | "parent" | "admin" {
  if (isAdminEmail(email)) return "admin";
  if (dbRole === "parent") return "parent";
  return "user";
}
