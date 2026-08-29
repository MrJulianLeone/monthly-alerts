"use client";

import { useState } from "react";

type Labels = {
  button: string;
  title: string;
  placeholder: string;
  send: string;
  thanks: string;
  error: string;
};

/**
 * Dashboard feedback widget: a ghost button that expands into a small form.
 * Submissions land in the admin support inbox and email the admin.
 */
export function FeedbackButton({ labels }: { labels: Labels }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setMessage("");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setOpen(!open);
          setSent(false);
        }}
      >
        {labels.button}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[90vw] sheet p-4 shadow-lg z-20 bg-sheet">
          {sent ? (
            <p className="text-sm text-ink-soft py-2">{labels.thanks}</p>
          ) : (
            <form onSubmit={submit}>
              <p className="field-label">{labels.title}</p>
              <textarea
                required
                rows={4}
                className="input mb-3"
                placeholder={labels.placeholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-red-700 mb-2">{labels.error}</p>}
              <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
                {labels.send}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
