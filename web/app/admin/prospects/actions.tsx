"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** "Run pipeline now" — same code path as the daily cron. */
export function RunNowButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/prospects/run", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Run failed");
      const parts = Object.entries(data as Record<string, Record<string, unknown>>).map(
        ([stage, r]) =>
          `${stage}: ${Object.entries(r)
            .map(([k, v]) => `${k}=${v}`)
            .join(" ")}`
      );
      setResult(parts.join(" · "));
      router.refresh();
    } catch (err) {
      setResult(err instanceof Error ? err.message : "Run failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 min-w-0">
      <button type="button" onClick={run} disabled={busy} className="btn btn-primary btn-sm shrink-0">
        {busy ? "Running…" : "Run pipeline now"}
      </button>
      {result && <span className="text-xs text-ink-soft truncate">{result}</span>}
    </div>
  );
}

/** Compact settings editor for the pipeline (cap, threshold, cadence, pause). */
export function SettingsForm(props: {
  paused: boolean;
  daily_cap: number;
  score_threshold: number;
  followup_days: number;
  snooze_months: number;
  target_notes: string | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...props, target_notes: props.target_notes ?? "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(overrides: Partial<typeof form> = {}) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/prospects/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ...overrides }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Save failed");
      setMsg("Saved");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  const num = (key: "daily_cap" | "score_threshold" | "followup_days" | "snooze_months", label: string) => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type="number"
        className="input"
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
      />
    </label>
  );

  return (
    <div className="sheet p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        {num("daily_cap", "Daily send cap")}
        {num("score_threshold", "Score threshold")}
        {num("followup_days", "Follow-up days")}
        {num("snooze_months", "Snooze months")}
      </div>
      <label className="block mb-4">
        <span className="field-label">Targeting notes (fed to scoring + drafting)</span>
        <textarea
          className="input min-h-20"
          value={form.target_notes}
          placeholder="e.g. Prioritize residential remodelers in Texas; mention Spanish-speaking crews."
          onChange={(e) => setForm({ ...form, target_notes: e.target.value })}
        />
      </label>
      <div className="flex items-center gap-3">
        <button type="button" disabled={busy} className="btn btn-ghost btn-sm" onClick={() => save()}>
          Save settings
        </button>
        <button
          type="button"
          disabled={busy}
          className={`btn btn-sm ${form.paused ? "btn-primary" : "btn-danger"}`}
          onClick={() => {
            const paused = !form.paused;
            setForm({ ...form, paused });
            save({ paused });
          }}
        >
          {form.paused ? "Resume sending" : "Pause sending"}
        </button>
        {msg && <span className="text-xs text-ink-soft">{msg}</span>}
      </div>
    </div>
  );
}
