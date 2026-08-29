"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Last-resort boundary for errors in the root layout itself. Must render its
// own <html>/<body> and can't rely on globals.css having loaded.

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
          color: "#1c1917",
          background: "#faf9f7",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>Something went wrong</h1>
          <p style={{ fontSize: "0.9375rem", color: "#57534e", marginBottom: "1.5rem" }}>
            The problem has been reported. If it keeps happening, reach us at
            monthlyalerts.com/contact.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#1c1917",
              color: "#fff",
              border: "none",
              borderRadius: "2px",
              padding: "0.625rem 1.5rem",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
