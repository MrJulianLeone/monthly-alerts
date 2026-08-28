"use client";

import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function UnsubscribeConfirm({ u, s, lang }: { u: string; s: string; lang: Lang }) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <>
        <h1 className="display text-3xl mb-3">{t(lang, "unsubscribe_done_title")}</h1>
        <p className="text-sm text-ink-soft leading-relaxed">{t(lang, "unsubscribe_done_body")}</p>
      </>
    );
  }
  return (
    <>
      <h1 className="display text-3xl mb-6">{t(lang, "email_monthly_unsubscribe")}</h1>
      <button
        disabled={busy || !u || !s}
        className="btn btn-primary"
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await fetch("/api/email/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ u, s }),
          });
          setBusy(false);
          if (res.ok) setDone(true);
          else setError(t(lang, "error_generic"));
        }}
      >
        {t(lang, "email_monthly_unsubscribe")}
      </button>
      {error && <p className="text-sm text-accent-deep mt-3">{error}</p>}
    </>
  );
}
