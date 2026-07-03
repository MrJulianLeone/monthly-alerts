"use client";

import { useState } from "react";

type Board = { id: string; name: string };

/**
 * Settings invites: friend invites (all users, joins your leaderboard), family
 * invites (adult accounts, invites them to their own account), and — for a
 * minor with no parent yet — a "parent" invite (the adult who accepts becomes
 * their parent/guardian).
 */
export function InviteForms({
  isAdult,
  needsParent,
}: {
  isAdult: boolean;
  needsParent: boolean;
}) {
  return (
    <section className="space-y-4">
      <FriendInviteForm />
      {isAdult && <FamilyInviteForm />}
      {needsParent && <ParentInviteForm />}
    </section>
  );
}

function ParentInviteForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/invites/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not send the invite");
        return;
      }
      setEmail("");
      setSent(true);
    } catch {
      setError("Could not send the invite. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InviteCard
      title="Invite a parent"
      description="Since you're under 16, invite a parent or guardian by email. When they accept, they become your parent and can oversee your account."
      email={email}
      onEmailChange={setEmail}
      onSubmit={submit}
      busy={busy}
      sent={sent}
      error={error}
    />
  );
}

function FriendInviteForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSent(false);
    try {
      // Friend invites ride on leaderboard referrals — make sure a board exists.
      const boardsRes = await fetch("/api/leaderboards");
      if (!boardsRes.ok) throw new Error();
      let boards = ((await boardsRes.json()) as { leaderboards: Board[] }).leaderboards;
      if (boards.length === 0) {
        const createRes = await fetch("/api/leaderboards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "My Leaderboard" }),
        });
        if (!createRes.ok) throw new Error();
        boards = [((await createRes.json()) as { leaderboard: Board }).leaderboard];
      }
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), leaderboardId: boards[0].id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not send the invite");
        return;
      }
      setEmail("");
      setSent(true);
    } catch {
      setError("Could not send the invite. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InviteCard
      title="Invite a friend"
      description="They'll get an email invite and join your leaderboard when they sign up."
      email={email}
      onEmailChange={setEmail}
      onSubmit={submit}
      busy={busy}
      sent={sent}
      error={error}
    />
  );
}

function FamilyInviteForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/invites/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not send the invite");
        return;
      }
      setEmail("");
      setSent(true);
    } catch {
      setError("Could not send the invite. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <InviteCard
      title="Invite family"
      description="Invite a family member to start their own MonthlyAlerts coaching."
      email={email}
      onEmailChange={setEmail}
      onSubmit={submit}
      busy={busy}
      sent={sent}
      error={error}
    />
  );
}

function InviteCard({
  title,
  description,
  email,
  onEmailChange,
  onSubmit,
  busy,
  sent,
  error,
}: {
  title: string;
  description: string;
  email: string;
  onEmailChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  sent: boolean;
  error: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <p className="mt-1 text-xs text-neutral-500">{description}</p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="name@example.com"
          className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
        />
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Invite"}
        </button>
      </div>
      {sent && <p className="mt-2 text-sm text-green-600">Invite sent.</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}
