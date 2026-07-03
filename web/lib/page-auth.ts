import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

/** Server-component guard: redirects to /login when signed out or wrong role. */
export async function requirePageUser(role?: "parent" | "admin"): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role && user.role !== "admin") redirect("/login");
  return user;
}

export function homeForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "parent") return "/parent";
  return "/chat";
}
