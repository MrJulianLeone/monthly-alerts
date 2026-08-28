"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function ForgotForm({ lang }: { lang: Lang }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (sent) {
    return (
      <div className="border-[1.5px] border-ok rounded-[2px] p-5">
        <p className="display text-xl mb-2 text-ok">{t(lang, "email_sent_title")}</p>
        <p className="text-sm text-ink-soft leading-relaxed">
          {t(lang, "reset_sent_body", { email })}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang }),
        });
        setSent(true);
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
        autoComplete="email"
        className="input mb-4"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {t(lang, "forgot_submit")}
      </button>
    </form>
  );
}
