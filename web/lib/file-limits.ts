/**
 * Project file cabinet limits and pure helpers. This module has no server
 * dependencies so the browser can pre-check an upload with the same rules
 * the API enforces (lib/files.ts).
 */
export const MAX_FILE_BYTES = 20 * 1024 * 1024; // per file
export const MAX_FILES_PER_PROJECT = 50;
export const MAX_TOTAL_BYTES_PER_PROJECT = 500 * 1024 * 1024; // sum of all files

export const PDF_CONTENT_TYPE = "application/pdf";
export const MAX_FILENAME_LENGTH = 200;

export type FileUsage = { count: number; bytes: number };

export type LimitViolation = "too_large" | "too_many" | "total_exceeded";

/** Why an upload of `size` bytes can't be accepted right now, or null if it can. */
export function limitViolation(usage: FileUsage, size: number): LimitViolation | null {
  if (size > MAX_FILE_BYTES) return "too_large";
  if (usage.count >= MAX_FILES_PER_PROJECT) return "too_many";
  if (usage.bytes + size > MAX_TOTAL_BYTES_PER_PROJECT) return "total_exceeded";
  return null;
}

/** Blob key layout: the client picks the UUID, the server validates the shape. */
export function filePathname(projectId: string, uuid: string): string {
  return `projects/${projectId}/files/${uuid}.pdf`;
}

export function isValidFilePathname(projectId: string, pathname: string): boolean {
  return new RegExp(`^projects/${projectId}/files/[0-9a-f-]{36}\\.pdf$`).test(pathname);
}

/** Trim a user-supplied filename to something safe to display. */
export function cleanFilename(raw: unknown): string {
  const name =
    typeof raw === "string"
      ? raw
          .replace(/[\x00-\x1f\x7f\\/]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : "";
  const base = name || "document.pdf";
  const withExt = /\.pdf$/i.test(base) ? base : `${base}.pdf`;
  return withExt.slice(0, MAX_FILENAME_LENGTH);
}

export function formatBytes(bytes: number): string {
  const mb = 1024 * 1024;
  if (bytes >= mb) return `${(bytes / mb).toFixed(bytes >= 10 * mb ? 0 : 1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
