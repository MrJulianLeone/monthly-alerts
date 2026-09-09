"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CompForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("Try your next project on us");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage(null);
        const res = await fetch("/api/admin/credits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, note }),
        });
        const data = await res.json().catch(() => ({}));
        setBusy(false);
        if (res.ok) {
          setMessage(`Credited ${email}.`);
          setEmail("");
          router.refresh();
        } else {
          setMessage(data.error ?? "Failed");
        }
      }}
    >
      <div>
        <label className="field-label">Account email</label>
        <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="field-label">Note</label>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">Grant one free project</button>
        {message && <span className="text-sm text-ink-soft">{message}</span>}
      </div>
    </form>
  );
}
