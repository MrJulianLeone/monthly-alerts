import Link from "next/link";
import { Logo } from "@/components/logo";
import { LogoutButton } from "@/components/logout-button";
import { t, type Lang } from "@/lib/i18n";

/** Signed-in chrome: logo, projects, settings, logout (+ admin for the site admin). */
export function AppHeader({
  lang,
  userName,
  showAdmin = false,
}: {
  lang: Lang;
  userName: string | null;
  showAdmin?: boolean;
}) {
  return (
    <header className="app-header border-b-[1.5px] border-line-strong bg-sheet">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Logo href="/dashboard" />
        <nav className="flex items-center gap-5">
          {showAdmin && (
            <Link href="/admin" className="microlabel text-accent hover:text-ink transition-colors">
              Admin
            </Link>
          )}
          <Link href="/dashboard" className="microlabel hover:text-ink transition-colors">
            {t(lang, "nav_projects")}
          </Link>
          <Link href="/settings" className="microlabel hover:text-ink transition-colors">
            {t(lang, "nav_settings")}
          </Link>
          <span className="hidden sm:inline microlabel text-ink">{userName}</span>
          <LogoutButton label={t(lang, "log_out")} />
        </nav>
      </div>
    </header>
  );
}
