"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmingButton } from "@/components/confirming-button";
import { locale, t, type Lang } from "@/lib/i18n";

/**
 * Per-section budget vs. actual. Everyone sees the figures; only the owner
 * gets the inline editor. Actuals above budget render in red.
 */
export function SectionBudget({
  sectionId,
  budget,
  actual,
  currency,
  isOwner,
  lang,
}: {
  sectionId: string;
  budget: string | null;
  actual: string | null;
  currency: string;
  isOwner: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [budgetVal, setBudgetVal] = useState(budget ?? "");
  const [actualVal, setActualVal] = useState(actual ?? "");
  const [busy, setBusy] = useState(false);

  const fmt = new Intl.NumberFormat(locale(lang), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  const b = budget !== null ? Number(budget) : null;
  const a = actual !== null ? Number(actual) : null;
  const over = b !== null && a !== null && a > b;

  if (editing) {
    return (
      <form
        className="no-print flex flex-wrap items-center gap-2 py-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await fetch(`/api/sections/${sectionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              budget: budgetVal.trim() === "" ? null : Number(budgetVal),
              actual: actualVal.trim() === "" ? null : Number(actualVal),
            }),
          });
          setBusy(false);
          setEditing(false);
          router.refresh();
        }}
      >
        <label className="microlabel">{t(lang, "budget_label")}</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input !w-32 !py-1.5 text-sm"
          value={budgetVal}
          onChange={(e) => setBudgetVal(e.target.value)}
        />
        <label className="microlabel">{t(lang, "actual_label")}</label>
        <input
          type="number"
          min="0"
          step="0.01"
          className="input !w-32 !py-1.5 text-sm"
          value={actualVal}
          onChange={(e) => setActualVal(e.target.value)}
        />
        <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
          {t(lang, "save")}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>
          {t(lang, "cancel")}
        </button>
      </form>
    );
  }

  if (b === null && a === null) {
    return isOwner ? (
      <button
        className="no-print microlabel hover:text-ink cursor-pointer py-1.5"
        onClick={() => setEditing(true)}
      >
        + {t(lang, "budget_set")}
      </button>
    ) : null;
  }

  return (
    <p className="microlabel py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
      <span>
        {t(lang, "budget_label")}: <span className="text-ink">{b !== null ? fmt.format(b) : "—"}</span>
      </span>
      <span>
        {t(lang, "actual_label")}:{" "}
        <span className={over ? "text-red-700 font-medium" : "text-ink"}>
          {a !== null ? fmt.format(a) : "—"}
        </span>
      </span>
      {over && b !== null && a !== null && (
        <span className="text-red-700">
          +{new Intl.NumberFormat(locale(lang), { style: "currency", currency, maximumFractionDigits: 0 }).format(a - b)}{" "}
          {t(lang, "over_budget")}
        </span>
      )}
      {isOwner && (
        <button
          className="no-print hover:text-ink cursor-pointer uppercase"
          onClick={() => setEditing(true)}
        >
          {t(lang, "edit")}
        </button>
      )}
    </p>
  );
}

export function PrintButton({ label }: { label: string }) {
  return (
    <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
      ⎙ {label}
    </button>
  );
}

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

/** Rename, reorder (editors) and delete (owners) for a section header. */
export function SectionTools({
  sectionId,
  name,
  isOwner,
  isFirst,
  isLast,
  lang,
}: {
  sectionId: string;
  name: string;
  isOwner: boolean;
  isFirst: boolean;
  isLast: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [value, setValue] = useState(name);

  const move = async (direction: "up" | "down") => {
    await fetch(`/api/sections/${sectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
  };

  if (renaming) {
    return (
      <form
        className="no-print flex items-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!value.trim()) return;
          await fetch(`/api/sections/${sectionId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: value }),
          });
          setRenaming(false);
          router.refresh();
        }}
      >
        <input
          autoFocus
          className="input !w-48 !py-1 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button type="submit" className="microlabel hover:text-ink cursor-pointer uppercase">
          {t(lang, "save")}
        </button>
        <button
          type="button"
          className="microlabel hover:text-ink cursor-pointer uppercase"
          onClick={() => {
            setValue(name);
            setRenaming(false);
          }}
        >
          {t(lang, "cancel")}
        </button>
      </form>
    );
  }

  return (
    <span className="no-print flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 sm:opacity-100">
      {!isFirst && (
        <button
          className="microlabel hover:text-ink cursor-pointer"
          title={t(lang, "move_up")}
          onClick={() => move("up")}
        >
          ↑
        </button>
      )}
      {!isLast && (
        <button
          className="microlabel hover:text-ink cursor-pointer"
          title={t(lang, "move_down")}
          onClick={() => move("down")}
        >
          ↓
        </button>
      )}
      <button
        className="microlabel hover:text-ink cursor-pointer"
        onClick={() => setRenaming(true)}
      >
        {t(lang, "edit")}
      </button>
      {isOwner && (
        <ConfirmingButton
          label={t(lang, "delete")}
          confirmLabel={t(lang, "confirm_delete")}
          className="microlabel text-red-700 hover:text-red-900 cursor-pointer"
          onConfirm={async () => {
            await fetch(`/api/sections/${sectionId}`, { method: "DELETE" });
            router.refresh();
          }}
        />
      )}
    </span>
  );
}

/** Reorder arrows for an item row (editors). */
export function ItemMove({
  itemId,
  isFirst,
  isLast,
  lang,
}: {
  itemId: string;
  isFirst: boolean;
  isLast: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const move = async (direction: "up" | "down") => {
    await fetch(`/api/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ move: direction }),
    });
    router.refresh();
  };
  return (
    <span className="no-print shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        className={`microlabel cursor-pointer ${isFirst ? "invisible" : "hover:text-ink"}`}
        title={t(lang, "move_up")}
        onClick={() => move("up")}
      >
        ↑
      </button>
      <button
        className={`microlabel cursor-pointer ${isLast ? "invisible" : "hover:text-ink"}`}
        title={t(lang, "move_down")}
        onClick={() => move("down")}
      >
        ↓
      </button>
    </span>
  );
}

/** Drafts an empty checklist's sections with AI from a project description. */
export function TemplateGenerator({ projectId, lang }: { projectId: string; lang: Lang }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (description.trim().length < 10) return;
        setBusy(true);
        setFailed(false);
        const res = await fetch(`/api/projects/${projectId}/generate-sections`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        }).catch(() => null);
        setBusy(false);
        if (res?.ok) {
          router.refresh();
        } else {
          setFailed(true);
        }
      }}
    >
      <p className="microlabel mb-3">{t(lang, "template_describe_label")}</p>
      <textarea
        className="input w-full"
        rows={3}
        maxLength={2000}
        placeholder={t(lang, "template_describe_placeholder")}
        value={description}
        disabled={busy}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || description.trim().length < 10}
          className="btn btn-primary"
        >
          {busy ? t(lang, "template_generating") : t(lang, "template_generate")}
        </button>
        {failed && (
          <span className="microlabel text-red-700">{t(lang, "template_generate_failed")}</span>
        )}
      </div>
    </form>
  );
}
