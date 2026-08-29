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
 * Floating feedback widget: a round mail button fixed to the bottom-right of
 * the dashboard that opens a small form. Submissions land in the admin
 * support inbox and email the admin.
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
    <div className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-30">
      {open && (
        <div className="absolute bottom-full right-0 mb-3 w-80 max-w-[calc(100vw-2.5rem)] sheet p-4 shadow-lg bg-sheet">
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
      <button
        type="button"
        aria-label={labels.button}
        title={labels.button}
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          setSent(false);
        }}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white shadow-lg border-[1.5px] border-ink transition-colors hover:bg-accent hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
