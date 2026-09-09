"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires one analytics event when a server-rendered page mounts. */
export function TrackEvent({
  event,
  props,
}: {
  event: AnalyticsEvent;
  props?: Record<string, string | number | boolean>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
