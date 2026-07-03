"use client";

import { useState } from "react";

export function CalorieGoalForm({
  currentGoal,
  isAutoEstimated,
}: {
  currentGoal: number;
  isAutoEstimated: boolean;
}) {
  const [goal, setGoal] = useState(String(currentGoal));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [auto, setAuto] = useState(isAutoEstimated);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(goal);
    if (!value || isNaN(value) || value < 800 || value > 6000) {
      setError("Enter a daily goal between 800 and 6000 kcal.");
      return;
    }
    await submit(Math.round(value));
  }

  async function reset() {
    await submit(null);
    setAuto(true);
  }

  async function submit(value: number | null) {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyCalorieGoal: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not save");
        return;
      }
      const saved = (data as { profile?: { daily_calorie_goal?: number | null } }).profile;
      if (saved?.daily_calorie_goal != null) {
        setGoal(String(saved.daily_calorie_goal));
        setAuto(false);
      }
      setSaved(true);
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Daily calorie goal</h2>
      <p className="mt-1 text-xs text-neutral-500">
        After each meal, your coach tells you how many calories you have left for the day.
        {auto ? " This target is auto-estimated from your profile." : ""}
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={800}
          max={6000}
          step="10"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Daily goal (kcal)"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <button
          type="submit"
          disabled={busy || !goal || isNaN(Number(goal))}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {!auto && (
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="mt-2 text-xs font-medium text-neutral-500 underline hover:text-neutral-900 disabled:opacity-50"
        >
          Reset to auto-estimate
        </button>
      )}
      {saved && <p className="mt-2 text-sm text-green-600">Saved.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
