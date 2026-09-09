"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { track } from "@/lib/analytics";
import { t, type Lang } from "@/lib/i18n";

export function NewProjectForm({
  lang,
  template,
}: {
  lang: Lang;
  template: { slug: string; name: string } | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(template?.name ?? "");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, address, description, template: template?.slug }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.id) {
          track("project_created", { draft: !!data.draft, template: template?.slug ?? "" });
          if (template) track("template_used", { template: template.slug });
          router.push(`/projects/${data.id}`);
          router.refresh();
        } else if (res.status === 409 && data.error === "too_many_drafts") {
          setBusy(false);
          setError(t(lang, "too_many_drafts"));
        } else {
          setBusy(false);
          setError(t(lang, "error_generic"));
        }
      }}
      className="space-y-5"
    >
      <div>
        <label className="field-label" htmlFor="pname">
          {t(lang, "field_project_name")}
        </label>
        <input
          id="pname"
          required
          autoFocus
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="paddress">
          {t(lang, "field_address")} <span className="normal-case">({t(lang, "optional")})</span>
        </label>
        <input
          id="paddress"
          className="input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div>
        <label className="field-label" htmlFor="pdesc">
          {t(lang, "field_description")} <span className="normal-case">({t(lang, "optional")})</span>
        </label>
        <textarea
          id="pdesc"
          rows={3}
          className="input resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-accent-deep">{error}</p>}
      <button type="submit" disabled={busy} className="btn btn-primary w-full">
        {t(lang, "create_project")}
      </button>
    </form>
  );
}
