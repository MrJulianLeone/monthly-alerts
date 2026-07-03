"use client";

import { useState } from "react";

const LB_PER_KG = 2.2046226218;

export function WeightForm() {
  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const lbs = Number(weight);
    if (!lbs || isNaN(lbs)) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: lbs / LB_PER_KG }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not save");
        return;
      }
      setSaved(true);
      setWeight("");
    } catch {
      setError("Could not save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Log today&apos;s weight</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Optional — weight trends appear in your monthly summary.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          min={45}
          max={880}
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight (lbs)"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <button
          type="submit"
          disabled={busy || !weight || isNaN(Number(weight))}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
      {saved && <p className="mt-2 text-sm text-green-600">Saved.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
