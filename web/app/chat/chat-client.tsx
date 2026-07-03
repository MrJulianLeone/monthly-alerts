"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BottomNav, GearIcon } from "@/components/bottom-nav";

export type Message = {
  id: string;
  sender: "coach" | "user";
  kind: string;
  content: string | null;
  metadata: {
    challenge_id?: string;
    balance?: string;
    items?: string[];
    calories?: number | null;
    meal_calories?: number | null;
    calories_consumed?: number;
    calorie_goal?: number;
    calories_remaining?: number;
  } | null;
  created_at: string;
};

const BALANCE_LABELS: Record<string, string> = {
  balanced: "Balanced plate",
  needs_protein: "Add some protein",
  needs_vegetables: "Add some vegetables",
  heavy: "On the heavy side",
  light: "A lighter meal",
  unclear: "Meal logged",
};

export type Challenge = {
  id: string;
  sequence_number: number;
  target_value: number;
  name: string;
  unit: string;
} | null;

type Sheet = "photo" | "challenge" | null;

export function ChatClient({
  displayName,
  initialMessages,
  initialChallenge,
  initialAction,
}: {
  displayName: string;
  initialMessages: Message[];
  initialChallenge: Challenge;
  initialAction?: "photo" | "challenge";
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [challenge, setChallenge] = useState<Challenge>(initialChallenge);
  const [sheet, setSheet] = useState<Sheet>(initialAction ?? null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const refreshMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat?limit=100");
      if (!res.ok) return;
      const data = (await res.json()) as { messages: Message[] };
      setMessages(data.messages.slice().reverse());
    } catch {
      // Network hiccup — the next poll will catch up.
    }
  }, []);

  // Keep the feed fresh like a messenger (light polling).
  useEffect(() => {
    const t = setInterval(refreshMessages, 30_000);
    return () => clearInterval(t);
  }, [refreshMessages]);

  // Pin the view to the newest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: firstRender.current ? "auto" : "smooth",
    });
    firstRender.current = false;
  }, [messages]);

  function closeSheet() {
    setSheet(null);
    setError(null);
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function openPhotoPicker() {
    setError(null);
    fileInputRef.current?.click();
  }

  function onPhotoSelected(file: File | null) {
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setSheet("photo");
  }

  async function sendPhoto() {
    if (!photoFile || busy) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("photo", photoFile);
      const res = await fetch("/api/meals", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not send the photo. Try again.");
        return;
      }
      await refreshMessages();
      closeSheet();
    } catch {
      setError("Could not send the photo. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmChallenge() {
    if (!challenge || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not confirm. Try again.");
        return;
      }
      setChallenge((data as { next: Challenge }).next ?? null);
      await refreshMessages();
      closeSheet();
    } catch {
      setError("Could not confirm. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function explainChallenge() {
    if (!challenge || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges/explain", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not get an explanation. Try again.");
        return;
      }
      await refreshMessages();
      closeSheet();
    } catch {
      setError("Could not get an explanation. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function passChallenge() {
    if (!challenge || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/challenges/skip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: challenge.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not swap the challenge. Try again.");
        return;
      }
      setChallenge((data as { next: Challenge }).next ?? null);
      await refreshMessages();
      closeSheet();
    } catch {
      setError("Could not swap the challenge. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const unitLabel = challenge?.unit === "seconds" ? "seconds" : "reps";

  return (
    <div className="mx-auto flex h-[100dvh] max-w-2xl flex-col">
      {/* Conversation header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
          C
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">Your Coach</p>
          <p className="truncate text-xs text-neutral-500">
            {challenge
              ? `Challenge #${challenge.sequence_number}: ${challenge.name} — ${challenge.target_value} ${unitLabel}`
              : `Coaching ${displayName}`}
          </p>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="-mr-1.5 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
        >
          <GearIcon />
        </Link>
      </header>

      {/* Message feed */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 pb-24 pt-4">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-500">
            No messages yet — your coach will kick things off shortly.
          </p>
        ) : (
          messages.map((m) => <ChatBubble key={m.id} message={m} />)
        )}
      </div>

      <BottomNav
        active="chat"
        onPhoto={openPhotoPicker}
        onChallenge={() => {
          setError(null);
          setSheet("challenge");
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
      />

      {/* Photo confirmation sheet */}
      {sheet === "photo" && (
        <BottomSheet title="Send meal photo" onClose={closeSheet} disabled={busy}>
          {photoPreview ? (
            <>
              {/* Local object URL preview — next/image can't optimize blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Meal preview"
                className="mx-auto max-h-64 w-full rounded-xl object-cover"
              />
              <p className="mt-3 text-center text-sm text-neutral-500">
                Send this photo to your coach for feedback?
              </p>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-neutral-500">
              Snap or choose a photo of your meal and your coach will review it.
            </p>
          )}
          {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={openPhotoPicker}
              disabled={busy}
              className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
            >
              {photoPreview ? "Retake" : "Choose photo"}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={sendPhoto}
                disabled={busy}
                className="flex-1 rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send to coach"}
              </button>
            )}
          </div>
        </BottomSheet>
      )}

      {/* Challenge menu sheet: mark complete, explain, or pass for another */}
      {sheet === "challenge" && (
        <BottomSheet title="Your challenge" onClose={closeSheet} disabled={busy}>
          {challenge ? (
            <>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Challenge #{challenge.sequence_number}
                </p>
                <p className="mt-1 text-lg font-semibold text-neutral-900">{challenge.name}</p>
                <p className="mt-0.5 text-sm text-neutral-600">
                  {challenge.target_value} {unitLabel}
                </p>
              </div>
              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={confirmChallenge}
                  disabled={busy}
                  className="w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
                >
                  {busy ? "Working…" : "I did it — mark complete"}
                </button>
                <button
                  type="button"
                  onClick={explainChallenge}
                  disabled={busy}
                  className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Explain this exercise
                </button>
                <button
                  type="button"
                  onClick={passChallenge}
                  disabled={busy}
                  className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Pass — give me a different one
                </button>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-neutral-500">
              No active challenge right now — your coach will post the next one in chat.
            </p>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

function BottomSheet({
  title,
  onClose,
  disabled,
  children,
}: {
  title: string;
  onClose: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={disabled ? undefined : onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-2xl rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-300" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-50"
            aria-label="Close sheet"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isCoach = message.sender === "coach";

  if (message.kind === "meal_photo") {
    const balance = message.metadata?.balance ?? "unclear";
    const items = message.metadata?.items ?? [];
    const calories = message.metadata?.calories;
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-neutral-900 px-4 py-3 text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Meal logged
          </p>
          <p className="mt-0.5 text-sm font-semibold">{BALANCE_LABELS[balance] ?? "Meal logged"}</p>
          {items.length > 0 && (
            <p className="mt-1 text-xs leading-relaxed text-neutral-300">{items.join(", ")}</p>
          )}
          {typeof calories === "number" && calories > 0 && (
            <p className="mt-1 text-xs font-medium text-neutral-400">≈ {calories} kcal</p>
          )}
        </div>
      </div>
    );
  }

  if (message.kind === "calorie_summary") {
    const remaining = message.metadata?.calories_remaining;
    const goal = message.metadata?.calorie_goal;
    const consumed = message.metadata?.calories_consumed;
    const over = typeof remaining === "number" && remaining < 0;
    return (
      <div className="flex justify-start">
        <div className="max-w-[82%] rounded-2xl rounded-bl-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-neutral-900">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
            Daily calories
          </p>
          {typeof remaining === "number" && (
            <p className="mt-0.5 text-lg font-semibold text-neutral-900">
              {over
                ? `${Math.abs(remaining)} kcal over`
                : `${remaining} kcal left`}
            </p>
          )}
          {typeof consumed === "number" && typeof goal === "number" && (
            <p className="text-xs text-neutral-600">
              {consumed} / {goal} kcal today
            </p>
          )}
          {message.content && (
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
              {message.content}
            </p>
          )}
        </div>
      </div>
    );
  }

  const content = message.kind === "challenge_complete" ? "I did it." : message.content;
  if (!content) return null;

  return (
    <div className={`flex ${isCoach ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[82%] px-4 py-2.5 text-sm leading-relaxed ${
          isCoach
            ? "rounded-2xl rounded-bl-md border border-neutral-200 bg-neutral-100 text-neutral-900"
            : "rounded-2xl rounded-br-md bg-neutral-900 text-white"
        }`}
      >
        {message.kind === "monthly_summary" && (
          <p className="mb-1 text-[11px] font-bold tracking-widest text-amber-600">
            MONTHLY SUMMARY
          </p>
        )}
        <p className="whitespace-pre-line">{content}</p>
      </div>
    </div>
  );
}
