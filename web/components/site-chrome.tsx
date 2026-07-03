"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Hides global chrome (top header) on the full-screen messenger chat view. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/chat") return null;
  return <>{children}</>;
}
