"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { t, type Lang } from "@/lib/i18n";

type Stats = { signups: number; activated: number; earned_cents: number };

const dollars = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

/** Settings: claim a referral link, see its stats, and the credit balance. */
export function ReferralCard({
  lang,
  initialCode,
  suggested,
  siteUrl,
  stats,
  balanceCents,
  creditDisplay,
  priceDisplay,
  ledger,
}: {
  lang: Lang;
  initialCode: string | null;
  suggested: string;
  siteUrl: string;
  stats: Stats | null;
  balanceCents: number;
  creditDisplay: string;
  priceDisplay: string;
  ledger: { id: string; amount_cents: number; reason: string; project_name: string | null; note: string | null; created_at: string }[];
}) {
  const [code, setCode] = useState(initialCode);
  const [draft, setDraft] = useState(initialCode ?? suggested);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const url = code ? `${siteUrl}/${code}` : null;

  return (
    <div className="sheet p-8 mt-6">
      <p className="microlabel mb-2">{t(lang, "referral_label")}</p>
      <h2 className="display text-2xl mb-2">{t(lang, "referral_title")}</h2>
      <p className="text-sm text-ink-soft leading-relaxed mb-5">
        {t(lang, "referral_body", { credit: creditDisplay })}
      </p>

      <form
        className="flex gap-2 items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const res = await fetch("/api/referrals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: draft }),
          });
          const data = await res.json().catch(() => ({}));
          setBusy(false);
          if (res.ok && data.code) {
            setCode(data.code);
            setDraft(data.code);
            track("referral_code_claimed");
          } else {
            const key =
              data.error === "taken"
                ? "referral_error_taken"
                : data.error === "reserved"
                  ? "referral_error_reserved"
                  : "referral_error_invalid";
            setError(t(lang, key));
          }
        }}
      >
        <div className="flex-1">
          <label className="field-label" htmlFor="refcode">
            {t(lang, "referral_code_label")}
          </label>
          <div className="flex items-center">
            <span className="text-sm text-ink-faint font-mono pr-1 hidden sm:inline">
              {siteUrl.replace(/^https?:\/\//, "")}/
            </span>
            <input
              id="refcode"
              className="input font-mono uppercase"
              value={draft}
              maxLength={20}
              onChange={(e) => setDraft(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            />
          </div>
        </div>
        <button type="submit" disabled={busy || draft.length < 4 || draft === code} className="btn btn-primary">
          {code ? t(lang, "save") : t(lang, "referral_claim")}
        </button>
      </form>
      {error && <p className="text-sm text-accent-deep mt-2">{error}</p>}

      {url && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <code className="text-sm bg-paper border border-line-strong rounded-[2px] px-3 py-2 select-all">
            {url}
          </code>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                // clipboard unavailable — the link is selectable
              }
            }}
          >
            {copied ? `✓ ${t(lang, "referral_copied")}` : t(lang, "referral_copy")}
          </button>
        </div>
      )}

      {stats && (
        <p className="microlabel mt-4">
          {t(lang, "referral_stats", {
            signups: stats.signups,
            activated: stats.activated,
            earned: dollars(stats.earned_cents),
          })}
        </p>
      )}

      <div className="mt-6 pt-5 border-t border-line">
        <p className="text-sm font-semibold">{t(lang, "referral_balance", { balance: dollars(balanceCents) })}</p>
        <p className="text-sm text-ink-soft leading-relaxed mt-1">
          {t(lang, "referral_balance_hint", { price: priceDisplay })}
        </p>
        {ledger.length > 0 && (
          <ul className="mt-3 divide-y divide-line">
            {ledger.slice(0, 10).map((row) => (
              <li key={row.id} className="py-2 flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-soft truncate">
                  {row.reason === "referral"
                    ? t(lang, "ledger_referral", { project: row.project_name ?? "—" })
                    : row.reason === "redeem"
                      ? t(lang, "ledger_redeem", { project: row.project_name ?? "—" })
                      : t(lang, "ledger_comp")}
                </span>
                <span className={`font-mono shrink-0 ${row.amount_cents < 0 ? "text-ink-faint" : "text-ok"}`}>
                  {row.amount_cents < 0 ? "−" : "+"}
                  {dollars(Math.abs(row.amount_cents))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
