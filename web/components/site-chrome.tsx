"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** App screens render their own chrome (title bar + bottom nav). */
const APP_ROUTES = ["/chat", "/leaderboard", "/settings"];

/** Hides global chrome (top header) on full-screen app views. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (APP_ROUTES.includes(pathname)) return null;
  return <>{children}</>;
}
