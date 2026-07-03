import type { ReactNode } from "react";
import Link from "next/link";
import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

/**
 * Shared layout for the app's main screens (Coach chat, Leaderboard,
 * Settings): sticky title bar on top, content in the middle, and the
 * x.com-style bottom navigation bar.
 *
 * `backHref` renders a back arrow in the title bar. `hideNav` drops the
 * bottom bar entirely — used by full-screen views like Settings where the
 * only way out is the back button, so the user can't tap through to chat
 * actions without returning to the chat screen first.
 */
export function AppShell({
  title,
  subtitle,
  active,
  backHref,
  hideNav = false,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: BottomNavTab;
  backHref?: string;
  hideNav?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        {backHref && (
          <Link
            href={backHref}
            aria-label="Back"
            className="-ml-1.5 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Link>
        )}
        <div className="min-w-0">
          <p className="text-base font-semibold text-neutral-900">{title}</p>
          {subtitle && <p className="truncate text-xs text-neutral-500">{subtitle}</p>}
        </div>
      </header>
      <main className={`flex-1 px-4 pt-4 ${hideNav ? "pb-8" : "pb-28"}`}>{children}</main>
      {!hideNav && active && <BottomNav active={active} />}
    </div>
  );
}
