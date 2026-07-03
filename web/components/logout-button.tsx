"use client";

import { useRouter } from "next/navigation";

export function LogoutButton({
  className = "font-medium text-neutral-600 hover:text-neutral-900",
}: {
  className?: string;
}) {
  const router = useRouter();
  return (
    <button
      className={className}
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      Log out
    </button>
  );
}
