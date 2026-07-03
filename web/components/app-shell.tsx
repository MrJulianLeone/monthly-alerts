import type { ReactNode } from "react";
import { BottomNav, type BottomNavTab } from "@/components/bottom-nav";

/**
 * Shared layout for the app's main screens (Coach chat, Leaderboard,
 * Settings): sticky title bar on top, content in the middle, and the
 * x.com-style bottom navigation bar.
 */
export function AppShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle?: string;
  active: BottomNavTab;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <p className="text-base font-semibold text-neutral-900">{title}</p>
        {subtitle && <p className="truncate text-xs text-neutral-500">{subtitle}</p>}
      </header>
      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav active={active} />
    </div>
  );
}
