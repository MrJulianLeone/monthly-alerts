import type { SessionUser } from "@/lib/auth";

/** Single hardcoded site admin. */
export const ADMIN_EMAIL = "julianleone@gmail.com";

export function isAdmin(user: SessionUser | null): boolean {
  return user?.email === ADMIN_EMAIL;
}
