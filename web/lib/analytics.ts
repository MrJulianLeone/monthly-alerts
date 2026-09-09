"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Conversion events. Every event goes to Vercel Web Analytics; when the ad
 * tags are configured (NEXT_PUBLIC_GOOGLE_ADS_ID / NEXT_PUBLIC_META_PIXEL_ID,
 * see components/ad-pixels.tsx) the same events are mirrored to Google Ads
 * and Meta so campaigns can optimize on activated projects, not clicks.
 *
 * Funnel: signup → project_created → checkout_started → project_activated.
 */
export type AnalyticsEvent =
  | "signup"
  | "project_created"
  | "template_used"
  | "checkout_started"
  | "project_activated"
  | "referral_code_claimed";

type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const PROJECT_VALUE = { value: 100, currency: "USD" };

export function track(event: AnalyticsEvent, props: Props = {}) {
  try {
    vercelTrack(event, props);
  } catch {
    // analytics must never break the page
  }
  if (typeof window === "undefined") return;

  const gadsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (typeof window.gtag === "function") {
    window.gtag("event", event, props);
    // Google Ads conversion actions are addressed by label; the one that
    // matters for bidding is the activated project.
    const label =
      event === "project_activated"
        ? process.env.NEXT_PUBLIC_GOOGLE_ADS_ACTIVATION_LABEL
        : event === "signup"
          ? process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL
          : undefined;
    if (gadsId && label) {
      window.gtag("event", "conversion", {
        send_to: `${gadsId}/${label}`,
        ...(event === "project_activated" ? PROJECT_VALUE : {}),
      });
    }
  }

  if (typeof window.fbq === "function") {
    if (event === "project_activated") window.fbq("track", "Purchase", PROJECT_VALUE);
    else if (event === "signup") window.fbq("track", "CompleteRegistration");
    else if (event === "checkout_started") window.fbq("track", "InitiateCheckout", PROJECT_VALUE);
    else if (event === "project_created") window.fbq("track", "Lead");
    else window.fbq("trackCustom", event, props);
  }
}
