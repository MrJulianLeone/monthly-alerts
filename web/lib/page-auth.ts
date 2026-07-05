import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

/**
 * Server-component guard. Signed-out visitors on coached pages go to the
 * welcome screen (where they can start as a guest in one tap); role-guarded
 * dashboards still require a real login.
 */
export async function requirePageUser(role?: "parent" | "admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(role ? "/login" : "/");
  if (role && user.role !== role && user.role !== "admin") redirect("/login");
  return user;
}

export function homeForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "parent") return "/parent";
  return "/chat";
}
