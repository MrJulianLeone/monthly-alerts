import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { homeForRole } from "@/lib/page-auth";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
          MonthlyAlerts
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin" className="font-medium text-neutral-600 hover:text-neutral-900">
                  Admin
                </Link>
              )}
              {user.role === "parent" ? (
                <Link
                  href={homeForRole(user.role)}
                  className="font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/chat" className="font-medium text-neutral-600 hover:text-neutral-900">
                    Coach chat
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/settings"
                    className="font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Settings
                  </Link>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="font-medium text-neutral-600 hover:text-neutral-900">
                Log in
              </Link>
              <Link
                href="/"
                className="rounded-lg bg-neutral-900 px-3.5 py-2 font-semibold text-white hover:bg-neutral-700"
              >
                Start chatting
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
