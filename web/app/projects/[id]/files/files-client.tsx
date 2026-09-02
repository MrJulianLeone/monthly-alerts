"use client";

import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ConfirmingButton } from "@/components/confirming-button";
import {
  filePathname,
  formatBytes,
  limitViolation,
  MAX_FILE_BYTES,
  MAX_FILES_PER_PROJECT,
  MAX_TOTAL_BYTES_PER_PROJECT,
  PDF_CONTENT_TYPE,
  type FileUsage,
  type LimitViolation,
} from "@/lib/file-limits";
import { t, type Lang } from "@/lib/i18n";

type Row = {
  id: string;
  name: string;
  url: string;
  size: string;
  uploader: string | null;
  date: string;
  canDelete: boolean;
};

type Progress = { name: string; n: number; total: number; pct: number };

const VIOLATIONS: LimitViolation[] = ["too_large", "too_many", "total_exceeded"];

/** Hard ceilings so a stalled request can never leave the button stuck. */
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;
const REGISTER_TIMEOUT_MS = 60 * 1000;

/** A real PDF starts with "%PDF-"; the extension and MIME type are just hints. */
async function looksLikePdf(file: File): Promise<boolean> {
  try {
    return (await file.slice(0, 5).text()) === "%PDF-";
  } catch {
    return false;
  }
}

/**
 * File list + uploader. Uploads go straight from the browser to Vercel Blob
 * (token from /api/projects/[id]/files/upload), then get registered with
 * POST /api/projects/[id]/files. Limits are pre-checked here so most
 * refusals never leave the browser; the server re-checks everything.
 */
export function FileCabinet({
  projectId,
  files,
  usage,
  canUpload,
  limitsLabel,
  lang,
}: {
  projectId: string;
  files: Row[];
  usage: FileUsage;
  canUpload: boolean;
  limitsLabel: string;
  lang: Lang;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const violationMessage = (violation: LimitViolation, name: string) => {
    switch (violation) {
      case "too_large":
        return t(lang, "files_too_large", { name, size: formatBytes(MAX_FILE_BYTES) });
      case "too_many":
        return t(lang, "files_too_many", { count: MAX_FILES_PER_PROJECT });
      case "total_exceeded":
        return t(lang, "files_total_exceeded", {
          total: formatBytes(MAX_TOTAL_BYTES_PER_PROJECT),
        });
    }
  };

  async function uploadOne(file: File, running: FileUsage, report: (pct: number) => void) {
    const name = file.name;
    if (!(await looksLikePdf(file))) return t(lang, "files_not_pdf", { name });
    const violation = limitViolation(running, file.size);
    if (violation) return violationMessage(violation, name);

    try {
      const blob = await upload(filePathname(projectId, crypto.randomUUID()), file, {
        access: "public",
        handleUploadUrl: `/api/projects/${projectId}/files/upload`,
        contentType: PDF_CONTENT_TYPE,
        clientPayload: JSON.stringify({ name, size: file.size }),
        onUploadProgress: ({ percentage }) => report(Math.round(percentage)),
        abortSignal: AbortSignal.timeout(UPLOAD_TIMEOUT_MS),
      });
      report(100);
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: blob.url, name }),
        signal: AbortSignal.timeout(REGISTER_TIMEOUT_MS),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { code?: string };
        if (data.code === "not_pdf") return t(lang, "files_not_pdf", { name });
        if (VIOLATIONS.includes(data.code as LimitViolation)) {
          return violationMessage(data.code as LimitViolation, name);
        }
        return t(lang, "files_upload_failed", { name });
      }
      running.count += 1;
      running.bytes += file.size;
      return null;
    } catch {
      return t(lang, "files_upload_failed", { name });
    }
  }

  async function handleFiles(list: FileList) {
    const picked = Array.from(list);
    const running: FileUsage = { ...usage };
    const failed: string[] = [];
    let added = 0;
    setErrors([]);
    setDone(null);

    try {
      for (let i = 0; i < picked.length; i++) {
        const file = picked[i];
        const report = (pct: number) =>
          setProgress({ name: file.name, n: i + 1, total: picked.length, pct });
        report(0);
        const problem = await uploadOne(file, running, report);
        if (problem) failed.push(problem);
        else added += 1;
      }
    } finally {
      // Whatever happened above, the button must come back.
      setProgress(null);
      setErrors(failed);
      if (added > 0) setDone(t(lang, "files_upload_done", { n: added }));
      router.refresh();
    }
  }

  return (
    <div>
      {canUpload && (
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p className="microlabel">{limitsLabel}</p>
          <button
            type="button"
            disabled={progress !== null}
            onClick={() => fileRef.current?.click()}
            className="btn btn-primary btn-sm shrink-0 self-start sm:self-auto"
          >
            {progress
              ? t(lang, "files_uploading", {
                  name: progress.name,
                  n: progress.n,
                  total: progress.total,
                  pct: progress.pct,
                })
              : t(lang, "files_upload")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={async (e) => {
              const list = e.target.files;
              if (!list || list.length === 0) return;
              await handleFiles(list);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {done && (
        <p className="no-print mb-6 text-sm text-ok" role="status">
          ✓ {done}
        </p>
      )}

      {errors.length > 0 && (
        <ul className="no-print mb-6 space-y-1" role="alert">
          {errors.map((message, i) => (
            <li key={i} className="text-sm text-accent-deep">
              {message}
            </li>
          ))}
        </ul>
      )}

      {files.length === 0 ? (
        <p className="text-sm text-ink-soft text-center py-8">{t(lang, "files_empty")}</p>
      ) : (
        <ul className="divide-y divide-line border-t-2 border-ink">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-3 group">
              <span className="text-ink-faint font-mono text-xs shrink-0" aria-hidden>
                PDF
              </span>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-0"
                title={f.name}
              >
                <span className="block text-[15px] truncate group-hover:text-accent-deep transition-colors">
                  {f.name}
                </span>
                <span className="block microlabel mt-0.5">
                  {f.size}
                  {f.uploader ? ` · ${f.uploader}` : ""}
                  {` · ${f.date}`}
                </span>
              </a>
              <div className="no-print flex items-center gap-2 shrink-0">
                <a
                  href={`${f.url}?download=1`}
                  className="btn btn-ghost btn-sm"
                  download={f.name}
                >
                  {t(lang, "files_download")}
                </a>
                {f.canDelete && (
                  <ConfirmingButton
                    label={t(lang, "delete")}
                    confirmLabel={t(lang, "confirm_delete")}
                    className="btn btn-danger btn-sm"
                    onConfirm={async () => {
                      await fetch(`/api/files/${f.id}`, { method: "DELETE" });
                      router.refresh();
                    }}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
