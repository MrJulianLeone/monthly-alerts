import Link from "next/link";

export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <rect width="24" height="24" rx="2" fill="#ea580c" />
      <path
        d="M6 12.5l4 4L18.5 8"
        stroke="#fff"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 sm:gap-2.5 shrink-0">
      <LogoMark />
      <span className="display text-lg sm:text-xl tracking-wide">
        Monthly<span className="text-accent">Alerts</span>
      </span>
    </Link>
  );
}
