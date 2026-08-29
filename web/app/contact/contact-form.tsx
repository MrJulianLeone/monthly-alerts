"use client";

import { useState } from "react";

type Labels = {
  name: string;
  email: string;
  subject: string;
  message: string;
  send: string;
  sending: string;
  sentTitle: string;
  sentBody: string;
  error: string;
};

export function ContactForm({ token, labels }: { token: string; labels: Labels }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans never see it
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, website, token }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(labels.error);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="sheet p-8 text-center">
        <h2 className="display text-2xl mb-2">{labels.sentTitle}</h2>
        <p className="text-sm text-ink-soft">{labels.sentBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="sheet p-6 sm:p-8">
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="contact-name" className="field-label">{labels.name}</label>
          <input
            id="contact-name"
            type="text"
            className="input"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="field-label">{labels.email}</label>
          <input
            id="contact-email"
            type="email"
            required
            className="input"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="contact-subject" className="field-label">{labels.subject}</label>
        <input
          id="contact-subject"
          type="text"
          className="input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="contact-message" className="field-label">{labels.message}</label>
        <textarea
          id="contact-message"
          required
          rows={7}
          className="input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {/* Honeypot: visually hidden, tempting to bots. aria-hidden + tabIndex
          keep it away from real users and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary">
        {busy ? labels.sending : labels.send}
      </button>
    </form>
  );
}
