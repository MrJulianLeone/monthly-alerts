"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, ErrorText } from "@/components/ui";

type Invite = {
  relationship: "family" | "parent";
  inviterName: string;
  inviteeEmail: string;
};

export function FamilyInviteFlow({ token }: { token: string }) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [state, setState] = useState<"loading" | "invalid" | "ready" | "accepted" | "declined">(
    "loading"
  );
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/invites/family/${token}`).then((r) => (r.ok ? r.json() : null)),
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
    const res = await fetch(`/api/invites/family/${token}`, {
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

  const isParent = invite?.relationship === "parent";

  if (state === "loading") return <Card>Checking your invitation...</Card>;
  if (state === "invalid") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">Invitation expired</h1>
        <p className="mt-2 text-sm text-neutral-500">
          This invitation is invalid or has expired. Ask your family member to send a new one.
        </p>
      </Card>
    );
  }
  if (state === "accepted") {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-neutral-900">You&apos;re all set</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {isParent ? (
            <>
              You&apos;re now {invite?.inviterName}&apos;s parent on MonthlyAlerts. Open your
              parent dashboard to follow their progress and receive their monthly summaries.
            </>
          ) : (
            <>You joined {invite?.inviterName} on MonthlyAlerts. Open the app to get started.</>
          )}
        </p>
        {isParent && (
          <Link
            href="/parent"
            className="mt-4 inline-block rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            Go to parent dashboard
          </Link>
        )}
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
        {isParent
          ? `${invite?.inviterName} asked you to be their parent`
          : `${invite?.inviterName} invited you`}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {isParent ? (
          <>
            Because {invite?.inviterName} is under 16, a parent or guardian needs to approve and
            oversee their MonthlyAlerts account. Accept to become their parent — you&apos;ll get a
            dashboard to follow their progress and their monthly summaries.
          </>
        ) : (
          <>
            Join {invite?.inviterName} on MonthlyAlerts — a personal health coach with daily meals
            and challenges and a monthly progress summary.
          </>
        )}
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
            {isParent ? (
              <>
                Create an account (or log in) using{" "}
                <span className="font-medium text-neutral-900">{invite?.inviteeEmail}</span>, then
                return to this link to accept.
              </>
            ) : (
              <>Log in or create an account first, then return to this link to accept.</>
            )}
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
