"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, ErrorText } from "@/components/ui";

type Invite = { leaderboardName: string; referrerName: string; inviteeEmail: string };

export function InviteFlow({ token }: { token: string }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [state, setState] = useState<"loading" | "invalid" | "ready" | "accepted" | "declined">(
    "loading"
  );
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/referrals/${token}`).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/auth/session").then((r) => r.ok),
    ]).then(([inviteData, isSignedIn]) => {
      if (!inviteData) return setState("invalid");
      setInvite(inviteData);
      setSignedIn(isSignedIn);
      setState("ready");
    });
  }, [token]);

  async function respond(action: "accept" | "decline") {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/referrals/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) {
      setError((await res.json()).error ?? "Something went wrong");
      return;
    }
    setState(action === "accept" ? "accepted" : "declined");
  }

  if (state === "loading") return <Card>Checking your invitation...</Card>;
  if (state === "invalid") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Invitation expired</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This invitation is invalid or has expired. Ask your friend to send a new one.
        </p>
      </Card>
    );
  }
  if (state === "accepted") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">You&apos;re in</h1>
        <p className="mt-2 text-sm text-neutral-500">
          You joined &quot;{invite?.leaderboardName}&quot;. Open the MonthlyAlerts app to see the
          standings.
        </p>
      </Card>
    );
  }
  if (state === "declined") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Invitation declined</h1>
        <p className="mt-2 text-sm text-neutral-500">No problem — nothing else to do.</p>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="text-xl font-semibold text-neutral-900">
        {invite?.referrerName} invited you
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        Join the leaderboard &quot;{invite?.leaderboardName}&quot; on MonthlyAlerts and keep each
        other accountable with daily meals and challenges.
      </p>
      {signedIn ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button disabled={busy} onClick={() => respond("accept")}>
            Accept
          </Button>
          <Button variant="secondary" disabled={busy} onClick={() => respond("decline")}>
            Decline
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-neutral-500">
            Log in or create an account first, then return to this link to accept.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-neutral-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-neutral-700"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-center text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              Log in
            </Link>
          </div>
        </div>
      )}
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}
