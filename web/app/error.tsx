"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

// Branded page-level error boundary (replaces Next's raw digest screen).

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="microlabel mb-3">Error</p>
        <h1 className="display text-4xl mb-4">Something went wrong</h1>
        <p className="text-sm text-ink-soft mb-6">
          The problem has been reported. Try again, or head back to your projects — if it
          keeps happening, email support@monthlyalerts.com.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-primary btn-sm">
            Try again
          </button>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Your projects
          </Link>
        </div>
        {error.digest && <p className="microlabel mt-6">ref {error.digest}</p>}
      </div>
    </main>
  );
}
