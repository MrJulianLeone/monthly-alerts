import Link from "next/link";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/logout-button";
import { isAdmin } from "@/lib/admin";
import type { SessionUser } from "@/lib/auth";
import { t, type Lang } from "@/lib/i18n";

/** Signed-in chrome: logo, projects, settings, logout (+ admin for the site admin). */
export function AppHeader({ lang, user }: { lang: Lang; user: SessionUser }) {
  return (
    <header className="app-header border-b-[1.5px] border-line-strong bg-sheet">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-3 sm:gap-5 min-w-0">
          {isAdmin(user) && (
            <Link href="/admin" className="microlabel text-accent hover:text-ink transition-colors">
              Admin
            </Link>
          )}
          {/* The logo already links to the dashboard, so this is desktop-only. */}
          <Link
            href="/dashboard"
            className="hidden sm:inline microlabel hover:text-ink transition-colors"
          >
            {t(lang, "nav_projects")}
          </Link>
          <Link href="/settings" className="microlabel hover:text-ink transition-colors">
            {t(lang, "nav_settings")}
          </Link>
          <span className="hidden md:inline microlabel text-ink">{user.name}</span>
          <LogoutButton label={t(lang, "log_out")} />
        </nav>
      </div>
    </header>
  );
}
