"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { t, type Lang } from "@/lib/i18n";

async function patchItem(itemId: string, body: Record<string, unknown>) {
  await fetch(`/api/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function ItemEditor(props: {
  itemId: string;
  title: string;
  description: string | null;
  originalTitle: string;
  translatedFrom: string | null;
  status: "open" | "in_progress" | "done";
  assigneeId: string | null;
  dueDate: string | null;
  members: { id: string; name: string }[];
  editable: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const { itemId, editable, lang } = props;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(props.title);
  const [description, setDescription] = useState(props.description ?? "");
  const [busy, setBusy] = useState(false);

  const statusOptions = [
    { value: "open", label: t(lang, "status_open") },
    { value: "in_progress", label: t(lang, "status_in_progress") },
    { value: "done", label: t(lang, "status_done") },
  ] as const;

  return (
    <div>
      {editing ? (
        <form
          className="space-y-4 mb-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            // The edited text becomes the new source, in the editor's language.
            await patchItem(itemId, { title, description });
            setBusy(false);
            setEditing(false);
            router.refresh();
          }}
        >
          <input
            className="input display text-2xl"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input resize-y"
            rows={4}
            placeholder={t(lang, "field_description")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {t(lang, "save")}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setTitle(props.title);
                setDescription(props.description ?? "");
                setEditing(false);
              }}
            >
              {t(lang, "cancel")}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <h1
              className="display text-3xl sm:text-4xl break-words"
              title={props.translatedFrom ? props.originalTitle : undefined}
            >
              {props.title}
            </h1>
            {editable && (
              <button className="btn btn-ghost btn-sm shrink-0" onClick={() => setEditing(true)}>
                {t(lang, "edit")}
              </button>
            )}
          </div>
          {props.translatedFrom && <p className="microlabel mt-2">{props.translatedFrom}</p>}
          {props.description && (
            <p className="text-[15px] text-ink-soft leading-relaxed mt-4 whitespace-pre-wrap">
              {props.description}
            </p>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-line">
        <div>
          <label className="field-label">{t(lang, "field_status")}</label>
          <select
            className="input cursor-pointer"
            disabled={!editable}
            value={props.status}
            onChange={async (e) => {
              await patchItem(itemId, { status: e.target.value });
              router.refresh();
            }}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">{t(lang, "field_assignee")}</label>
          <select
            className="input cursor-pointer"
            disabled={!editable}
            value={props.assigneeId ?? ""}
            onChange={async (e) => {
              await patchItem(itemId, { assignee_id: e.target.value || null });
              router.refresh();
            }}
          >
            <option value="">{t(lang, "unassigned")}</option>
            {props.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">{t(lang, "field_due_date")}</label>
          <input
            type="date"
            className="input"
            disabled={!editable}
            defaultValue={props.dueDate ?? ""}
            onChange={async (e) => {
              await patchItem(itemId, { due_date: e.target.value || null });
              router.refresh();
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function DeleteItemButton({
  itemId,
  projectId,
  lang,
}: {
  itemId: string;
  projectId: string;
  lang: Lang;
}) {
  const router = useRouter();
  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={async () => {
        if (!window.confirm(t(lang, "delete_item_confirm"))) return;
        await fetch(`/api/items/${itemId}`, { method: "DELETE" });
        router.push(`/projects/${projectId}`);
        router.refresh();
      }}
    >
      {t(lang, "delete")}
    </button>
  );
}

export function PhotoGrid({
  itemId,
  photos,
  canUpload,
  lang,
}: {
  itemId: string;
  photos: { id: string; url: string; canDelete: boolean }[];
  canUpload: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative group border-[1.5px] border-line-strong rounded-[2px] overflow-hidden">
            <a href={p.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="w-full h-36 object-cover" />
            </a>
            {p.canDelete && (
              <button
                className="absolute top-1.5 right-1.5 bg-ink/80 text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={async () => {
                  await fetch(`/api/photos/${p.id}`, { method: "DELETE" });
                  router.refresh();
                }}
              >
                {t(lang, "delete")}
              </button>
            )}
          </div>
        ))}
        {canUpload && (
          <button
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="h-36 border-2 border-dashed border-line-strong rounded-[2px] flex flex-col items-center justify-center gap-1 text-ink-faint hover:border-ink hover:text-ink transition-colors cursor-pointer"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="microlabel">{busy ? "…" : t(lang, "add_photo")}</span>
          </button>
        )}
      </div>
      {error && <p className="text-sm text-accent-deep mt-3">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          setError(null);
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(`/api/items/${itemId}/photos`, { method: "POST", body: form });
          setBusy(false);
          e.target.value = "";
          if (res.ok) router.refresh();
          else setError(t(lang, "error_generic"));
        }}
      />
    </div>
  );
}

export function CommentForm({ itemId, lang }: { itemId: string; lang: Lang }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setBusy(true);
        await fetch(`/api/items/${itemId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body }),
        });
        setBody("");
        setBusy(false);
        router.refresh();
      }}
    >
      <input
        className="input flex-1"
        placeholder={t(lang, "comment_placeholder")}
        value={body}
        disabled={busy}
        onChange={(e) => setBody(e.target.value)}
      />
      <button type="submit" disabled={busy || !body.trim()} className="btn btn-primary">
        {t(lang, "post_comment")}
      </button>
    </form>
  );
}

export function DeleteCommentButton({ commentId, lang }: { commentId: string; lang: Lang }) {
  const router = useRouter();
  return (
    <button
      className="microlabel text-red-700 hover:text-red-900 cursor-pointer shrink-0"
      onClick={async () => {
        await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
        router.refresh();
      }}
    >
      {t(lang, "delete")}
    </button>
  );
}
