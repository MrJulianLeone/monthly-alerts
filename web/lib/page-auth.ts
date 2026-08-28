import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/auth";
import type { Lang } from "@/lib/i18n";

export type PageContext = { user: SessionUser; lang: Lang };

/**
 * Guard for app pages: requires a session, and routes users who haven't
 * finished onboarding (basic info + language) there first.
 */
export async function requireOnboardedUser(currentPath?: string): Promise<PageContext> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboarded_at) {
    const next = currentPath ? `?next=${encodeURIComponent(currentPath)}` : "";
    redirect(`/welcome${next}`);
  }
  return { user, lang: user.preferred_language };
}
