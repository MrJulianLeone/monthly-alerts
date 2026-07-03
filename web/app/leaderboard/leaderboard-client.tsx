"use client";

import { useCallback, useEffect, useState } from "react";

type Board = { id: string; name: string; member_count: number };
type Standing = {
  rank: number;
  displayName: string;
  streak: number;
  challengesThisWeek: number;
  mealsThisWeek: number;
  score: number;
  isYou: boolean;
};

const GOAL = 5;

export function LeaderboardClient() {
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [selected, setSelected] = useState<Board | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadStandings = useCallback(async (boardId: string) => {
    setStandings([]);
    try {
      const res = await fetch(`/api/leaderboards/${boardId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { standings: Standing[] };
      setStandings(data.standings);
    } catch {
      // Ignore — the list simply stays empty.
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboards");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { leaderboards: Board[] };
      setBoards(data.leaderboards);
      const first = data.leaderboards[0] ?? null;
      setSelected(first);
      if (first) await loadStandings(first.id);
    } catch {
      setBoards([]);
      setError("Could not load leaderboards.");
    }
  }, [loadStandings]);

  useEffect(() => {
    load();
  }, [load]);

  function selectBoard(board: Board) {
    setSelected(board);
    setError("");
    setInviteSent(false);
    loadStandings(board.id);
  }

  async function createBoard() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leaderboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "My Leaderboard" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not create leaderboard");
        return;
      }
      await load();
    } catch {
      setError("Could not create leaderboard");
    } finally {
      setBusy(false);
    }
  }

  async function leaveBoard() {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    try {
      await fetch(`/api/leaderboards/${selected.id}/leave`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    setInviteSent(false);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), leaderboardId: selected.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "Could not send the invite");
        return;
      }
      setInviteEmail("");
      setInviteSent(true);
    } catch {
      setError("Could not send the invite");
    } finally {
      setBusy(false);
    }
  }

  if (boards === null) {
    return <p className="py-12 text-center text-sm text-neutral-500">Loading…</p>;
  }

  if (boards.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-neutral-900">Invite-only, friends first</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-500">
          Create a leaderboard, then invite friends by email. Build it to {GOAL} friends —
          you can join up to 3 leaderboards.
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={createBoard}
          disabled={busy}
          className="mt-4 w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create my leaderboard"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Board selector chips */}
      <div className="flex flex-wrap gap-2">
        {boards.map((board) => (
          <button
            key={board.id}
            type="button"
            onClick={() => selectBoard(board)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected?.id === board.id
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-600 hover:text-neutral-900"
            }`}
          >
            {board.name}
          </button>
        ))}
      </div>

      {selected && selected.member_count < GOAL && (
        <p className="text-sm font-medium text-amber-600">
          {selected.member_count}/{GOAL} friends — invite {GOAL - selected.member_count} more
          below.
        </p>
      )}

      {/* Standings */}
      <div className="space-y-2">
        {standings.length === 0 ? (
          <p className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
            No active friends in the last 14 days yet.
          </p>
        ) : (
          standings.map((s) => (
            <div
              key={s.rank}
              className={`flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm ${
                s.isYou ? "border-neutral-900" : "border-neutral-200"
              }`}
            >
              <span className="w-6 text-base font-bold text-neutral-400">{s.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-neutral-900">
                  {s.displayName}
                  {s.isYou ? " (you)" : ""}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {s.challengesThisWeek} challenges · {s.mealsThisWeek} meals · {s.streak}d
                  streak
                </p>
              </div>
              <span className="text-lg font-bold text-neutral-900">{s.score}</span>
            </div>
          ))
        )}
      </div>

      {/* Invite a friend */}
      {selected && (
        <form
          onSubmit={sendInvite}
          className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Invite a friend</h2>
          <p className="mt-1 text-xs text-neutral-500">
            We&apos;ll email them an invite to join &ldquo;{selected.name}&rdquo;.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="friend@example.com"
              className="min-w-0 flex-1 rounded-full border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
            />
            <button
              type="submit"
              disabled={busy || !inviteEmail.trim()}
              className="rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Invite"}
            </button>
          </div>
          {inviteSent && <p className="mt-2 text-sm text-green-600">Invite sent.</p>}
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={leaveBoard}
        disabled={busy}
        className="w-full rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50"
      >
        Leave this leaderboard
      </button>
    </div>
  );
}
