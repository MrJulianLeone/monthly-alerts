"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmingButton } from "@/components/confirming-button";

type Drafts = {
  draft_subject: string;
  draft_body: string;
  followup_subject: string;
  followup_body: string;
};

/**
 * Draft editor + lifecycle actions for one prospect. Approve queues the
 * initial email AND pre-approves the follow-up as a pair; the follow-up only
 * sends if no reply arrives.
 */
export function ProspectEditor(props: {
  id: string;
  status: string;
  email: string | null;
  website: string | null;
  drafts: Drafts;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(props.drafts);
  const [contact, setContact] = useState({ email: "", website: "", contact_name: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(body: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/prospects/${props.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setMsg(okMsg);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/prospects/${props.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/prospects");
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
    }
  }

  const editable = ["pending_approval", "approved", "scored"].includes(props.status);
  const field = (key: keyof Drafts, label: string, rows = 8) => (
    <label className="block">
      <span className="field-label">{label}</span>
      {key.endsWith("subject") ? (
        <input
          className="input"
          value={drafts[key]}
          disabled={!editable}
          onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })}
        />
      ) : (
        <textarea
          className="input font-mono text-xs leading-relaxed"
          rows={rows}
          value={drafts[key]}
          disabled={!editable}
          onChange={(e) => setDrafts({ ...drafts, [key]: e.target.value })}
        />
      )}
    </label>
  );

  return (
    <div className="space-y-6">
      {(props.drafts.draft_body || editable) && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="microlabel">Initial email ({"{{link}}"} becomes the tracked site link)</p>
            {field("draft_subject", "Subject")}
            {field("draft_body", "Body", 12)}
          </div>
          <div className="space-y-3">
            <p className="microlabel">Follow-up (auto-sends days later if no reply)</p>
            {field("followup_subject", "Subject")}
            {field("followup_body", "Body", 12)}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {editable && (
          <button
            type="button"
            disabled={busy}
            className="btn btn-ghost btn-sm"
            onClick={() => call({ action: "save_drafts", ...drafts }, "Drafts saved")}
          >
            Save drafts
          </button>
        )}
        {props.status === "pending_approval" && (
          <button
            type="button"
            disabled={busy}
            className="btn btn-primary btn-sm"
            onClick={async () => {
              await call({ action: "save_drafts", ...drafts }, "");
              await call({ action: "approve" }, "Approved — will send with the next run");
            }}
          >
            Approve both
          </button>
        )}
        {props.status === "approved" && (
          <button
            type="button"
            disabled={busy}
            className="btn btn-ghost btn-sm"
            onClick={() => call({ action: "unapprove" }, "Back to approval queue")}
          >
            Remove from send queue
          </button>
        )}
        {["no_website", "no_email", "closed", "rejected_fit"].includes(props.status) && (
          <button
            type="button"
            disabled={busy}
            className="btn btn-ghost btn-sm"
            onClick={() => call({ action: "retry" }, "Requeued for research")}
          >
            Retry research
          </button>
        )}
        {!["suppressed", "converted"].includes(props.status) && (
          <button
            type="button"
            disabled={busy}
            className="btn btn-ghost btn-sm"
            onClick={() => call({ action: "reject" }, "Closed")}
          >
            Reject
          </button>
        )}
        {props.email && props.status !== "suppressed" && (
          <ConfirmingButton
            label="Suppress"
            confirmLabel="Never contact again?"
            className="btn btn-danger btn-sm"
            disabled={busy}
            onConfirm={() => call({ action: "suppress" }, "Suppressed")}
          />
        )}
        <ConfirmingButton
          label="Delete"
          confirmLabel="Delete forever?"
          className="btn btn-danger btn-sm"
          disabled={busy}
          onConfirm={remove}
        />
        {msg && <span className="text-xs text-ink-soft">{msg}</span>}
      </div>

      <details className="sheet p-4">
        <summary className="microlabel cursor-pointer">Fix contact info manually</summary>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <label className="block">
            <span className="field-label">Email {props.email ? `(now: ${props.email})` : ""}</span>
            <input
              className="input"
              value={contact.email}
              onChange={(e) => setContact({ ...contact, email: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Website {props.website ? "(replace)" : ""}</span>
            <input
              className="input"
              value={contact.website}
              onChange={(e) => setContact({ ...contact, website: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="field-label">Contact name</span>
            <input
              className="input"
              value={contact.contact_name}
              onChange={(e) => setContact({ ...contact, contact_name: e.target.value })}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={busy}
          className="btn btn-ghost btn-sm mt-3"
          onClick={() => call({ action: "set_contact", ...contact }, "Contact updated")}
        >
          Save contact info
        </button>
      </details>
    </div>
  );
}
