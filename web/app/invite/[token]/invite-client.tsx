"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/** Logged-out invitee without an account: create a password and join. */
export function InviteRegisterForm({
  token,
  email,
  lang,
}: {
  token: string;
  email: string;
  lang: Lang;
}) {
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
        const res = await fetch("/api/invites/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.project_id) {
          router.push(`/welcome?next=${encodeURIComponent(`/projects/${data.project_id}`)}`);
          router.refresh();
        } else {
          setBusy(false);
          setError(
            data.error === "password_too_short"
              ? t(lang, "password_too_short")
              : t(lang, "error_generic")
          );
        }
      }}
    >
      <p className="text-sm text-ink-soft leading-relaxed mb-4">
        {t(lang, "invite_create_password", { email })}
      </p>
      {/* Present but hidden so password managers pair the password with the account email. */}
      <input
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        readOnly
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <label className="field-label" htmlFor="password">
        {t(lang, "password_label")}
      </label>
      <input
        id="password"
        name="password"
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
        {t(lang, "invite_join")}
      </button>
    </form>
  );
}

/** Logged-in invitee with the matching email: one click to join. */
export function AcceptInvite({ token, lang }: { token: string; lang: Lang }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        disabled={busy}
        className="btn btn-primary w-full"
        onClick={async () => {
          setBusy(true);
          setError(null);
          const res = await fetch("/api/invites/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.project_id) {
            router.push(`/projects/${data.project_id}`);
            router.refresh();
          } else {
            setBusy(false);
            setError(t(lang, "error_generic"));
          }
        }}
      >
        {t(lang, "invite_accept")}
      </button>
      {error && <p className="text-sm text-accent-deep mt-3">{error}</p>}
    </>
  );
}
