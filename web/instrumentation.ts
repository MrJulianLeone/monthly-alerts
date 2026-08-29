import * as Sentry from "@sentry/nextjs";

// Server/edge error tracking. Inert until SENTRY_DSN (or the public DSN) is
// set in the environment.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("./sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("./sentry.edge.config");
}

export const onRequestError = Sentry.captureRequestError;
