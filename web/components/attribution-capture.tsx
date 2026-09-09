"use client";

import { useEffect } from "react";

const ATTR_COOKIE = "ma_attr";
const DAYS = 90;
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];

/**
 * First-touch attribution: on the first visit that carries campaign
 * parameters (or any first visit, recording the landing page and referrer),
 * writes a small cookie that signup and project creation snapshot onto the
 * account. Never overwrites an existing first touch. Read by lib/attribution.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (document.cookie.split("; ").some((c) => c.startsWith(`${ATTR_COOKIE}=`))) return;
      const params = new URLSearchParams(window.location.search);
      const snapshot: Record<string, string> = {};
      for (const key of KEYS) {
        const v = params.get(key);
        if (v) snapshot[key] = v.slice(0, 200);
      }
      snapshot.landing = window.location.pathname.slice(0, 200);
      if (document.referrer && !document.referrer.includes(window.location.host)) {
        snapshot.referrer = document.referrer.slice(0, 200);
      }
      snapshot.ts = new Date().toISOString();
      const expires = new Date(Date.now() + DAYS * 86_400_000).toUTCString();
      document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(snapshot))}; expires=${expires}; path=/; SameSite=Lax`;
    } catch {
      // attribution is best-effort
    }
  }, []);
  return null;
}
