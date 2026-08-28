"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/** Logged-out invitee: email them a magic link that returns to this page. */
export function RequestInviteLink({
  email,
  token,
  lang,
}: {
  email: string;
  token: string;
  lang: Lang;
}) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

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
    <button
      disabled={busy}
      className="btn btn-primary w-full"
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/auth/request-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, lang, redirect: `/invite/${token}` }),
        });
        setBusy(false);
        if (res.ok) setSent(true);
      }}
    >
      {t(lang, "invite_accept")} — {email}
    </button>
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
