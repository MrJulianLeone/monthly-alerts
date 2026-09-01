"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Quick add: one company or website per line. */
export function QuickAddForm() {
  const router = useRouter();
  const [lines, setLines] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Add failed");
      setMsg(
        `Added ${data.added}.` +
          (data.skipped?.length ? ` Skipped: ${data.skipped.slice(0, 5).join("; ")}` : "")
      );
      setLines("");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Add failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sheet p-5">
      <label className="block mb-3">
        <span className="field-label">One per line — a website, a company name, or “Company | website”</span>
        <textarea
          className="input font-mono text-xs min-h-28"
          value={lines}
          placeholder={"smithremodeling.com\nAcme Builders | acmebuilders.net\nGarcia Construction LLC"}
          onChange={(e) => setLines(e.target.value)}
        />
      </label>
      <div className="flex items-center gap-3">
        <button type="button" disabled={busy || !lines.trim()} className="btn btn-primary btn-sm" onClick={submit}>
          {busy ? "Adding…" : "Add prospects"}
        </button>
        {msg && <span className="text-xs text-ink-soft">{msg}</span>}
      </div>
    </div>
  );
}

/** Roster import: CSV from a URL or pasted/uploaded text, filtered while parsing. */
export function RosterImportForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    source: "",
    url: "",
    csv: "",
    classification_like: "",
    city_like: "",
    region: "",
    issued_after: "",
    active_only: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setMsg("Importing — large files can take a few minutes…");
    try {
      const res = await fetch("/api/admin/prospects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, csv: form.csv || undefined, url: form.url || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      const cols = Object.entries(data.columns as Record<string, string | null>)
        .map(([k, v]) => `${k}→${v ?? "?"}`)
        .join(", ");
      setMsg(
        `Parsed ${data.parsed_rows} rows: staged ${data.staged}, filtered out ${data.skipped_filter}, ` +
          `duplicates ${data.skipped_dupe}. Columns: ${cols}`
      );
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    if (file.size > 4_000_000) {
      setMsg("File over 4MB — host it and use the URL field instead (request size limit).");
      return;
    }
    setForm({ ...form, csv: await file.text(), url: "" });
    setMsg(`Loaded ${file.name} (${Math.round(file.size / 1024)}KB)`);
  }

  const text = (key: keyof typeof form, label: string, placeholder = "") => (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        className="input"
        value={form[key] as string}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="sheet p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {text("source", "Import label", "e.g. cslb-2026-09")}
        {text("url", "CSV URL (for large state files)", "https://…")}
      </div>
      <label className="block">
        <span className="field-label">…or upload / paste CSV (small files, under 4MB)</span>
        <input
          type="file"
          accept=".csv,.txt"
          className="block text-sm mb-2"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          className="input font-mono text-xs min-h-20"
          value={form.csv.length > 5000 ? `(file loaded — ${form.csv.length.toLocaleString()} characters)` : form.csv}
          readOnly={form.csv.length > 5000}
          placeholder="BusinessName,City,State,Phone,Classification,LicenseNo,IssueDate,Status"
          onChange={(e) => setForm({ ...form, csv: e.target.value })}
        />
      </label>
      <div className="grid sm:grid-cols-4 gap-4">
        {text("classification_like", "Classification contains", "b, b-2, remodel")}
        {text("city_like", "City contains", "austin, dallas")}
        {text("region", "State equals", "CA")}
        {text("issued_after", "Licensed after", "2023-01-01")}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.active_only}
          onChange={(e) => setForm({ ...form, active_only: e.target.checked })}
        />
        Active licenses only
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy || (!form.csv && !form.url)}
          className="btn btn-primary btn-sm"
          onClick={submit}
        >
          {busy ? "Importing…" : "Stage roster"}
        </button>
        {msg && <span className="text-xs text-ink-soft">{msg}</span>}
      </div>
    </div>
  );
}

/** Promote staged candidates into the pipeline. */
export function PromoteButton(props: { source: string; pending: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function promote() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/prospects/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: props.source, limit: 50 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Promote failed");
      setMsg(`Promoted ${data.promoted}, skipped ${data.skipped} (dupes/suppressed)`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Promote failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={busy || props.pending === 0}
        className="btn btn-ghost btn-sm"
        onClick={promote}
      >
        {busy ? "Promoting…" : "Promote 50"}
      </button>
      {msg && <span className="text-xs text-ink-soft">{msg}</span>}
    </span>
  );
}
