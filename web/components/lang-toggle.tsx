"use client";

import { useRouter } from "next/navigation";
import { LANGUAGES, type Lang } from "@/lib/i18n";

/**
 * Pre-login language switch. Writes the ma_lang cookie (read server-side for
 * the landing/login pages and adopted as the initial preference at signup).
 */
export function LangToggle({ current }: { current: Lang }) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-1 border-[1.5px] border-line-strong rounded-[2px] p-0.5">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          className={`px-2 py-1 text-[11px] font-mono uppercase tracking-widest rounded-[2px] cursor-pointer transition-colors ${
            l.code === current
              ? "bg-ink text-white"
              : "text-ink-soft hover:text-ink"
          }`}
          onClick={() => {
            document.cookie = `ma_lang=${l.code}; path=/; max-age=31536000; samesite=lax`;
            router.refresh();
          }}
        >
          {l.code}
        </button>
      ))}
    </div>
  );
}
