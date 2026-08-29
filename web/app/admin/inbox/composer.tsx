"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Support-inbox composer. With a threadKey it renders a reply box (recipient
 * and subject fixed); without one, a full new-message form.
 */
export function Composer(props: {
  threadKey?: string;
  to?: string;
  subject?: string;
  from: string;
}) {
  const router = useRouter();
  const isReply = !!props.threadKey;
  const [to, setTo] = useState(props.to ?? "");
  const [subject, setSubject] = useState(props.subject ?? "");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, thread_key: props.threadKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Send failed");
      setBody("");
      if (isReply) {
        router.refresh();
      } else {
        router.push(`/admin/inbox/${encodeURIComponent(data.message.thread_key)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="sheet p-4 sm:p-5">
      {!isReply && (
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="compose-to" className="field-label">To</label>
            <input
              id="compose-to"
              type="email"
              required
              className="input"
              placeholder="customer@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="compose-subject" className="field-label">Subject</label>
            <input
              id="compose-subject"
              type="text"
              required
              className="input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>
      )}
      <label htmlFor="compose-body" className="field-label">
        {isReply ? `Reply to ${props.to}` : "Message"}
      </label>
      <textarea
        id="compose-body"
        required
        rows={isReply ? 4 : 8}
        className="input font-normal"
        placeholder="Write your message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
          {busy ? "Sending…" : isReply ? "Send reply" : "Send"}
        </button>
        <span className="microlabel">sends from {props.from}</span>
      </div>
    </form>
  );
}
