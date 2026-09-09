"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SpendForm({ channels, defaultMonth }: { channels: string[]; defaultMonth: string }) {
  const router = useRouter();
  const [month, setMonth] = useState(defaultMonth);
  const [channel, setChannel] = useState(channels[0] ?? "google");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const res = await fetch("/api/admin/spend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ month, channel, amount: Number(amount) }),
        });
        setBusy(false);
        if (res.ok) {
          setSaved(true);
          setAmount("");
          setTimeout(() => setSaved(false), 1500);
          router.refresh();
        }
      }}
    >
      <div>
        <label className="field-label">Month</label>
        <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} required />
      </div>
      <div>
        <label className="field-label">Channel</label>
        <select className="input" value={channel} onChange={(e) => setChannel(e.target.value)}>
          {channels.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="field-label">Spend ($)</label>
        <input type="number" min={0} step={1} className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <button type="submit" disabled={busy} className="btn btn-primary">
        {saved ? "✓ Saved" : "Save"}
      </button>
    </form>
  );
}
