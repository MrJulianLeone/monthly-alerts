"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function LoginForm({ lang, redirect }: { lang: Lang; redirect: string | null }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="border-[1.5px] border-ok rounded-[2px] p-5">
        <p className="display text-xl mb-2 text-ok">{t(lang, "login_sent_title")}</p>
        <p className="text-sm text-ink-soft leading-relaxed">
          {t(lang, "login_sent_body", { email })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/auth/request-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang, redirect }),
        });
        setBusy(false);
        if (res.ok) setSent(true);
        else setError(t(lang, "error_generic"));
      }}
    >
      <label className="field-label" htmlFor="email">
        {t(lang, "login_email_label")}
      </label>
      <input
        id="email"
        type="email"
        required
        autoFocus
        className="input mb-4"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <p className="text-sm text-accent-deep mb-4">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {t(lang, "login_submit")}
      </button>
    </form>
  );
}
