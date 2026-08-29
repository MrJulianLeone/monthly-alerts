"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmingButton } from "@/components/confirming-button";
import { LANGUAGES, langName, t, type Lang } from "@/lib/i18n";

export function ProjectDetailsForm(props: {
  projectId: string;
  name: string;
  address: string;
  description: string;
  currency: string;
  currencies: readonly string[];
  lang: Lang;
}) {
  const router = useRouter();
  const { lang } = props;
  const [name, setName] = useState(props.name);
  const [address, setAddress] = useState(props.address);
  const [description, setDescription] = useState(props.description);
  const [currency, setCurrency] = useState(props.currency);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        await fetch(`/api/projects/${props.projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, address, description, currency }),
        });
        setBusy(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        router.refresh();
      }}
    >
      <div>
        <label className="field-label">{t(lang, "field_project_name")}</label>
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="field-label">{t(lang, "field_address")}</label>
        <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="field-label">{t(lang, "field_description")}</label>
        <textarea
          className="input resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label">{t(lang, "currency_label")}</label>
        <select
          className="input !w-40 cursor-pointer"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {props.currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
        {saved ? `✓ ${t(lang, "saved")}` : t(lang, "save")}
      </button>
    </form>
  );
}

export function MemberRow(props: {
  projectId: string;
  userId: string;
  name: string;
  email: string;
  company: string | null;
  memberLang: Lang;
  role: "owner" | "editor" | "commenter";
  isProjectOwner: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  const { lang } = props;

  return (
    <li className="py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[15px] font-medium truncate">
          {props.name}
          <span className="microlabel ml-2">{langName(props.memberLang)}</span>
        </p>
        <p className="text-sm text-ink-faint truncate">
          {props.email}
          {props.company ? ` — ${props.company}` : ""}
        </p>
      </div>
      {props.isProjectOwner ? (
        <span className="chip text-accent shrink-0">{t(lang, "role_owner")}</span>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          <select
            className="input !w-auto py-1.5 text-sm cursor-pointer"
            value={props.role}
            onChange={async (e) => {
              await fetch(`/api/projects/${props.projectId}/members/${props.userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: e.target.value }),
              });
              router.refresh();
            }}
          >
            <option value="editor">{t(lang, "role_editor")}</option>
            <option value="commenter">{t(lang, "role_commenter")}</option>
          </select>
          <button
            className="microlabel text-red-700 hover:text-red-900 cursor-pointer"
            onClick={async () => {
              await fetch(`/api/projects/${props.projectId}/members/${props.userId}`, {
                method: "DELETE",
              });
              router.refresh();
            }}
          >
            {t(lang, "member_remove")}
          </button>
        </div>
      )}
    </li>
  );
}

export function InviteForm({ projectId, lang }: { projectId: string; lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "commenter">("editor");
  const [inviteLang, setInviteLang] = useState<Lang>(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch(`/api/projects/${projectId}/invites`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role, language: inviteLang }),
        });
        setBusy(false);
        if (res.ok) {
          setEmail("");
          router.refresh();
        } else {
          setError(t(lang, "error_generic"));
        }
      }}
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          className="input flex-1"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="input sm:!w-40 cursor-pointer"
          value={role}
          onChange={(e) => setRole(e.target.value as "editor" | "commenter")}
        >
          <option value="editor">{t(lang, "role_editor")}</option>
          <option value="commenter">{t(lang, "role_commenter")}</option>
        </select>
        <select
          className="input sm:!w-36 cursor-pointer"
          value={inviteLang}
          onChange={(e) => setInviteLang(e.target.value as Lang)}
          aria-label={t(lang, "invite_language_label")}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="btn btn-primary">
          {t(lang, "invite_send")}
        </button>
      </div>
      <p className="microlabel mt-2">
        {role === "editor" ? t(lang, "role_editor_desc") : t(lang, "role_commenter_desc")} ·{" "}
        {t(lang, "invite_language_label")}: {LANGUAGES.find((l) => l.code === inviteLang)?.label}
      </p>
      {error && <p className="text-sm text-accent-deep mt-2">{error}</p>}
    </form>
  );
}

export function InviteRow(props: {
  inviteId: string;
  email: string;
  role: "editor" | "commenter";
  expires: string;
  lang: Lang;
}) {
  const router = useRouter();
  const { lang } = props;
  return (
    <li className="py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[15px] truncate">{props.email}</p>
        <p className="microlabel">
          {t(lang, props.role === "editor" ? "role_editor" : "role_commenter")} · {props.expires}
        </p>
      </div>
      <button
        className="microlabel text-red-700 hover:text-red-900 cursor-pointer shrink-0"
        onClick={async () => {
          await fetch(`/api/invites/${props.inviteId}`, { method: "DELETE" });
          router.refresh();
        }}
      >
        {t(lang, "invite_revoke")}
      </button>
    </li>
  );
}

export function ArchiveButtons({
  projectId,
  archived,
  lang,
}: {
  projectId: string;
  archived: boolean;
  lang: Lang;
}) {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost btn-sm"
      onClick={async () => {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: !archived }),
        });
        router.refresh();
      }}
    >
      {archived ? t(lang, "unarchive_project") : t(lang, "archive_project")}
    </button>
  );
}

export function DeleteProjectButton({ projectId, lang }: { projectId: string; lang: Lang }) {
  const router = useRouter();
  return (
    <ConfirmingButton
      label={t(lang, "delete_project")}
      confirmLabel={t(lang, "confirm_delete")}
      className="btn btn-danger btn-sm"
      onConfirm={async () => {
        await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
        router.push("/dashboard");
        router.refresh();
      }}
    />
  );
}

export function ExtendButton({ projectId, label }: { projectId: string; label: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-primary btn-sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch(`/api/projects/${projectId}/extend`, { method: "POST" });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.checkout_url) {
            window.location.href = data.checkout_url;
            return;
          }
        } catch {}
        setBusy(false);
      }}
    >
      {label}
    </button>
  );
}
