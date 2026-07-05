"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cmToFtIn, ftInToCm } from "@/lib/units";

type Props = {
  displayName: string;
  goal: string | null;
  gender: string | null;
  dateOfBirth: string | null; // YYYY-MM-DD
  heightCm: number | null;
};

/**
 * "About you" — the goals and demographics we used to collect at sign-up.
 * Everything is optional; the more the coach knows, the better the plan
 * (age and gender tune challenge targets, height feeds calorie estimates).
 */
export function ProfileForm(initial: Props) {
  const router = useRouter();
  const initialFtIn = initial.heightCm ? cmToFtIn(Number(initial.heightCm)) : null;

  const [displayName, setDisplayName] = useState(initial.displayName);
  const [goal, setGoal] = useState(initial.goal ?? "");
  const [gender, setGender] = useState(initial.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth ?? "");
  const [heightFt, setHeightFt] = useState(initialFtIn ? String(initialFtIn.feet) : "");
  const [heightIn, setHeightIn] = useState(initialFtIn ? String(initialFtIn.inches) : "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          goal: goal || undefined,
          gender: gender || undefined,
          dateOfBirth: dateOfBirth || undefined,
          heightCm:
            heightFt || heightIn
              ? ftInToCm(Number(heightFt || 0), Number(heightIn || 0))
              : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not save. Try again.");
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900";

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">About you</h2>
      <p className="mt-1 text-xs text-neutral-500">
        All optional — the more your coach knows, the better your challenges and
        calorie targets get.
      </p>

      <div className="mt-3 space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-neutral-600">Goal</span>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass}>
            <option value="">Not set</option>
            <option value="lose_weight">Lose weight</option>
            <option value="build_strength">Build strength</option>
            <option value="get_fit">Get fit</option>
            <option value="build_habits">Build habits</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Birth date</span>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Height (ft)</span>
            <input
              type="number"
              min={2}
              max={8}
              value={heightFt}
              onChange={(e) => setHeightFt(e.target.value)}
              placeholder="5"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">Height (in)</span>
            <input
              type="number"
              min={0}
              max={11}
              value={heightIn}
              onChange={(e) => setHeightIn(e.target.value)}
              placeholder="10"
              className={inputClass}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={busy}
        className="mt-4 w-full rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save"}
      </button>
      {saved && <p className="mt-2 text-sm text-green-600">Saved.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
