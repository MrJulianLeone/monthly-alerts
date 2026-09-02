"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang, type MessageKey } from "@/lib/i18n";

const ERROR_KEYS: Record<string, MessageKey> = {
  invalid_credentials: "error_invalid_credentials",
  no_password: "error_no_password",
  unverified: "error_unverified",
  account_exists: "error_account_exists",
  password_too_short: "password_too_short",
  too_many: "error_too_many",
};

export function AuthForm({ lang, next }: { lang: Lang; next: string | null }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifySent, setVerifySent] = useState(false);
  const [unverified, setUnverified] = useState(false);

  if (verifySent) {
    return (
      <div className="border-[1.5px] border-ok rounded-[2px] p-5">
        <p className="display text-xl mb-2 text-ok">{t(lang, "email_sent_title")}</p>
        <p className="text-sm text-ink-soft leading-relaxed">
          {t(lang, "verify_sent_body", { email })}
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="microlabel mb-3">{t(lang, "app_name")}</p>
      <h1 className="display text-4xl mb-3">
        {t(lang, mode === "login" ? "login_title" : "signup_title")}
      </h1>
      <p className="text-sm text-ink-soft leading-relaxed mb-8">
        {t(lang, mode === "login" ? "login_sub" : "signup_sub")}
      </p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, lang }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && mode === "signup") {
            setVerifySent(true);
          } else if (res.ok) {
            router.push(
              data.onboarded
                ? (next ?? "/dashboard")
                : `/welcome?next=${encodeURIComponent(next ?? "/dashboard")}`
            );
            router.refresh();
          } else {
            setBusy(false);
            setUnverified(data.error === "unverified");
            const key = ERROR_KEYS[data.error as string];
            setError(key ? t(lang, key) : t(lang, "error_generic"));
          }
        }}
      >
        <label className="field-label" htmlFor="email">
          {t(lang, "login_email_label")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          className="input mb-4"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex items-baseline justify-between">
          <label className="field-label" htmlFor="password">
            {t(lang, "password_label")}
          </label>
          {mode === "login" && (
            <Link href="/forgot" className="microlabel hover:text-ink transition-colors">
              {t(lang, "forgot_password")}
            </Link>
          )}
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="input mb-1"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {mode === "signup" && <p className="microlabel mb-3">{t(lang, "password_hint")}</p>}
        {error && <p className="text-sm text-accent-deep my-3">{error}</p>}
        {unverified && (
          <button
            type="button"
            disabled={busy}
            className="text-sm underline hover:text-ink cursor-pointer mb-2"
            onClick={async () => {
              setBusy(true);
              // Re-signing up on an unverified account re-sends the link.
              const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, lang }),
              });
              setBusy(false);
              if (res.ok) setVerifySent(true);
            }}
          >
            {t(lang, "resend_verification")}
          </button>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary w-full mt-3">
          {t(lang, mode === "login" ? "login_submit" : "signup_submit")}
        </button>
      </form>
      <p className="text-sm text-ink-soft mt-6 text-center">
        {t(lang, mode === "login" ? "login_no_account" : "signup_have_account")}{" "}
        <button
          className="underline hover:text-ink cursor-pointer"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
        >
          {t(lang, mode === "login" ? "signup_submit" : "login_submit")}
        </button>
      </p>
    </>
  );
}
