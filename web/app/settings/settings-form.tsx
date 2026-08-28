"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LANGUAGES, t, type Lang } from "@/lib/i18n";

export function SettingsForm({
  initial,
}: {
  initial: {
    name: string;
    company: string;
    phone: string;
    preferred_language: Lang;
    email_opt_out: boolean;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const lang = form.preferred_language;

  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        setBusy(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }}
    >
      <p className="microlabel">{t(lang, "settings_profile")}</p>
      <div>
        <label className="field-label">{t(lang, "field_name")}</label>
        <input
          className="input"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">{t(lang, "field_company")}</label>
        <input
          className="input"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">{t(lang, "field_phone")}</label>
        <input
          type="tel"
          className="input"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">{t(lang, "field_language")}</label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setForm({ ...form, preferred_language: l.code })}
              className={`border-[1.5px] rounded-[2px] px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                form.preferred_language === l.code
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong text-ink-soft hover:border-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-2 border-t border-line">
        <p className="microlabel mb-3 mt-3">{t(lang, "settings_email_prefs")}</p>
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#ea580c]"
            checked={!form.email_opt_out}
            onChange={(e) => setForm({ ...form, email_opt_out: !e.target.checked })}
          />
          {t(lang, "settings_monthly_email")}
        </label>
      </div>
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {saved ? `✓ ${t(lang, "saved")}` : t(lang, "save")}
      </button>
    </form>
  );
}
