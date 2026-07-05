"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * The zero-signup entry point on the home screen: a coach welcome bubble and
 * a text box. Submitting (with or without a message) provisions a guest
 * account via /api/auth/guest and drops the visitor straight into the chat.
 */
export function StartChat({ rememberedName }: { rememberedName: string | null }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      let timezone = "UTC";
      try {
        timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      } catch {
        // Keep UTC if the browser can't resolve a timezone.
      }
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() || undefined, timezone }),
      });
      if (!res.ok) {
        setError("Could not start the chat. Please try again.");
        return;
      }
      router.push("/chat");
      router.refresh();
    } catch {
      setError("Could not start the chat. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-xl text-left">
      {rememberedName && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-neutral-700">
          Welcome back, <span className="font-semibold">{rememberedName}</span>!{" "}
          <Link href="/login" className="font-semibold underline hover:text-neutral-900">
            Log in
          </Link>{" "}
          to pick up where you left off, or start fresh below.
        </div>
      )}

      {/* Coach welcome bubble */}
      <div className="flex items-end gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
          C
        </div>
        <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm leading-relaxed text-neutral-900">
          Hi, I&apos;m your coach. No sign-up needed — just say hello or tell me
          what you want to work on, and we&apos;ll get started right away.
        </div>
      </div>

      {/* Text box */}
      <form onSubmit={start} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          placeholder="Say hi or share a goal…"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 bg-white px-5 py-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "Starting…" : "Start"}
        </button>
      </form>
      {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-center text-xs text-neutral-500">
        Free for 30 days. We remember you on this device — no account required.{" "}
        <Link href="/login" className="underline hover:text-neutral-900">
          Already have an account? Log in
        </Link>
      </p>
    </div>
  );
}
