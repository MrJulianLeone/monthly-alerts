"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card, ErrorText } from "@/components/ui";

export function SubscribeCard() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function checkout() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setBusy(false);
    if (!res.ok) {
      if (res.status === 401) {
        setError("Please log in first.");
        return;
      }
      setError((await res.json()).error ?? "Could not start checkout");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">Continue with MonthlyAlerts</h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Your first 30 days were free. Keep the daily coaching, meal feedback, sequential
        challenges, and monthly progress summaries going with a simple monthly subscription.
        Cancel anytime.
      </p>
      <ul className="mt-5 space-y-2 text-sm text-neutral-600">
        <li>— Daily AI coaching with meal photo analysis</li>
        <li>— Progressive challenges tuned to you</li>
        <li>— The monthly progress summary, in-app and by email</li>
        <li>— Leaderboards with friends</li>
      </ul>
      <Button onClick={checkout} disabled={busy} className="mt-6 w-full">
        {busy ? "Redirecting..." : "Start monthly subscription"}
      </Button>
      <ErrorText>{error}</ErrorText>
      <p className="mt-4 text-center text-sm text-neutral-400">
        Not signed in?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}
