"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type BottomNavProps = {
  active?: "home" | "chat";
  /** When provided, Photo/Did It render as action buttons; otherwise they link to /chat. */
  onPhoto?: () => void;
  onChallenge?: () => void;
};

/**
 * Fixed bottom navigation bar (x.com-style): icon tabs for Home and Coach chat
 * plus the two core actions — snap a meal photo and confirm a challenge.
 */
export function BottomNav({ active, onPhoto, onChallenge }: BottomNavProps) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-2xl items-stretch justify-around">
        <NavItem href="/me" label="Home" active={active === "home"}>
          <HomeIcon filled={active === "home"} />
        </NavItem>
        <NavItem href="/chat" label="Coach" active={active === "chat"}>
          <ChatIcon filled={active === "chat"} />
        </NavItem>
        <NavItem
          href={onPhoto ? undefined : "/chat?action=photo"}
          onClick={onPhoto}
          label="Photo"
        >
          <CameraIcon />
        </NavItem>
        <NavItem
          href={onChallenge ? undefined : "/chat?action=challenge"}
          onClick={onChallenge}
          label="Did It"
        >
          <CheckIcon />
        </NavItem>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  onClick,
  label,
  active = false,
  children,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  const className = `flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors ${
    active ? "font-semibold text-neutral-900" : "font-medium text-neutral-500 hover:text-neutral-900"
  }`;

  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? "page" : undefined}>
        {children}
        <span>{label}</span>
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
      <span>{label}</span>
    </button>
  );
}

function HomeIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 10.75 12 3.5l9 7.25V20a1 1 0 0 1-1 1h-5.25v-6h-5.5v6H4a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function ChatIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.6-.3-3.7-.8L3 21l1.8-5.8A8.5 8.5 0 1 1 21 11.5z" />
    </svg>
  );
}

function CameraIcon() {
  return (
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
      <path d="M4 7.5h2.5l1.5-2h8l1.5 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
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
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}
