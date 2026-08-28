"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

export function ResetForm({ lang, token }: { lang: Lang; token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/auth/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          router.push(data.onboarded ? "/dashboard" : "/welcome");
          router.refresh();
        } else {
          setBusy(false);
          setError(
            data.error === "password_too_short"
              ? t(lang, "password_too_short")
              : t(lang, "login_invalid_link")
          );
        }
      }}
    >
      <label className="field-label" htmlFor="password">
        {t(lang, "password_label")}
      </label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        autoFocus
        autoComplete="new-password"
        className="input mb-1"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p className="microlabel mb-4">{t(lang, "password_hint")}</p>
      {error && <p className="text-sm text-accent-deep mb-3">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {t(lang, "reset_submit")}
      </button>
    </form>
  );
}
