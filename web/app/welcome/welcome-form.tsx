"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";

export function WelcomeForm({ initialLang, next }: { initialLang: Lang; next: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [lang, setLang] = useState<Lang>(initialLang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            company,
            phone,
            preferred_language: lang,
            onboarded: true,
          }),
        });
        if (res.ok) {
          router.push(next);
          router.refresh();
        } else {
          setBusy(false);
          setError(t(lang, "error_generic"));
        }
      }}
      className="space-y-5"
    >
      <div>
        <label className="field-label">{t(lang, "field_language")}</label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLang(l.code)}
              className={`border-[1.5px] rounded-[2px] px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                lang === l.code
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong text-ink-soft hover:border-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="name">
          {t(lang, "field_name")}
        </label>
        <input
          id="name"
          required
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="company">
          {t(lang, "field_company")} <span className="normal-case">({t(lang, "optional")})</span>
        </label>
        <input
          id="company"
          className="input"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="phone">
          {t(lang, "field_phone")} <span className="normal-case">({t(lang, "optional")})</span>
        </label>
        <input
          id="phone"
          type="tel"
          className="input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-accent-deep">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {t(lang, "welcome_submit")}
      </button>
    </form>
  );
}
