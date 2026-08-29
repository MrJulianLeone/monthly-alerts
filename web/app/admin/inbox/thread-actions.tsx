"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmingButton } from "@/components/confirming-button";

/** Spam/not-spam toggle and permanent delete for one support thread. */
export function ThreadActions({
  threadKey,
  folder,
}: {
  threadKey: string;
  folder: "inbox" | "spam";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: "PATCH" | "DELETE", body: Record<string, string>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inbox/thread", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Action failed");
      }
      router.push(method === "DELETE" ? "/admin/inbox" : `/admin/inbox?folder=${folder === "spam" ? "inbox" : "spam"}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        className="btn btn-ghost btn-sm"
        onClick={() => call("PATCH", { key: threadKey, folder: folder === "spam" ? "inbox" : "spam" })}
      >
        {folder === "spam" ? "Not spam" : "Spam"}
      </button>
      <ConfirmingButton
        label="Delete"
        confirmLabel="Delete forever?"
        className="btn btn-danger btn-sm"
        disabled={busy}
        onConfirm={() => call("DELETE", { key: threadKey })}
      />
      {error && <span className="text-sm text-red-700">{error}</span>}
    </div>
  );
}
