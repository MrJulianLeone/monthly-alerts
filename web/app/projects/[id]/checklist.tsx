"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t, type Lang } from "@/lib/i18n";

/**
 * Tri-state check control: empty (open) → slash (in progress) → check (done).
 * Clicking cycles open → done → open; in-progress is set from the item page.
 */
export function StatusCheckbox({
  itemId,
  status,
  disabled,
}: {
  itemId: string;
  status: "open" | "in_progress" | "done";
  disabled: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const next = status === "done" ? "open" : "done";

  return (
    <button
      disabled={disabled || busy}
      aria-label={status}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        setBusy(false);
        router.refresh();
      }}
      className={`w-5 h-5 shrink-0 border-2 rounded-[2px] flex items-center justify-center transition-colors ${
        status === "done"
          ? "bg-accent border-accent text-white"
          : status === "in_progress"
            ? "border-accent text-accent"
            : "border-line-strong hover:border-ink"
      } ${disabled ? "cursor-default" : "cursor-pointer"}`}
    >
      {status === "done" && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="square" />
        </svg>
      )}
      {status === "in_progress" && (
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 10L10 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" />
        </svg>
      )}
    </button>
  );
}

export function AddItemForm({
  projectId,
  sectionId,
  lang,
}: {
  projectId: string;
  sectionId: string;
  lang: Lang;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setBusy(true);
        await fetch(`/api/projects/${projectId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section_id: sectionId, title }),
        });
        setTitle("");
        setBusy(false);
        router.refresh();
      }}
    >
      <span className="w-5 h-5 shrink-0 border-2 border-dashed border-line-strong rounded-[2px]" />
      <input
        className="flex-1 bg-transparent text-[15px] placeholder:text-ink-faint focus:outline-none"
        placeholder={`+ ${t(lang, "item_title_placeholder")}`}
        value={title}
        disabled={busy}
        onChange={(e) => setTitle(e.target.value)}
      />
      {title.trim() && (
        <button type="submit" disabled={busy} className="btn btn-ghost btn-sm">
          {t(lang, "add_item")}
        </button>
      )}
    </form>
  );
}

export function AddSectionForm({ projectId, lang }: { projectId: string; lang: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button className="btn btn-ghost w-full" onClick={() => setOpen(true)}>
        + {t(lang, "add_section")}
      </button>
    );
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setBusy(true);
        await fetch(`/api/projects/${projectId}/sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        setName("");
        setBusy(false);
        setOpen(false);
        router.refresh();
      }}
    >
      <input
        autoFocus
        className="input flex-1"
        placeholder={t(lang, "section_name_placeholder")}
        value={name}
        disabled={busy}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={busy || !name.trim()} className="btn btn-primary">
        {t(lang, "add")}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
        {t(lang, "cancel")}
      </button>
    </form>
  );
}

/** Rename (editors) and delete (owners) for a section header. */
export function SectionTools({
  sectionId,
  isOwner,
  lang,
}: {
  sectionId: string;
  isOwner: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  return (
    <span className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100">
      <button
        className="microlabel hover:text-ink cursor-pointer"
        onClick={async () => {
          const name = window.prompt(t(lang, "section_name_placeholder"));
          if (!name?.trim()) return;
          await fetch(`/api/sections/${sectionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
          });
          router.refresh();
        }}
      >
        {t(lang, "edit")}
      </button>
      {isOwner && (
        <button
          className="microlabel text-red-700 hover:text-red-900 cursor-pointer"
          onClick={async () => {
            if (!window.confirm(t(lang, "delete_item_confirm"))) return;
            await fetch(`/api/sections/${sectionId}`, { method: "DELETE" });
            router.refresh();
          }}
        >
          {t(lang, "delete")}
        </button>
      )}
    </span>
  );
}
