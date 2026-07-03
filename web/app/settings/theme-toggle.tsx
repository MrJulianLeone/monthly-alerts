"use client";

import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "ma_theme";

function apply(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function select(next: Theme) {
    setTheme(next);
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
    apply(next);
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">Appearance</h2>
      <p className="mt-1 text-xs text-neutral-500">
        Dark mode applies across the whole app on this device.
      </p>
      <div className="mt-3 flex gap-2">
        {(["system", "light", "dark"] as Theme[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => select(option)}
            aria-pressed={theme === option}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium capitalize transition-colors ${
              theme === option
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}
