// Libs
import { env } from "@/env";

export async function register(): Promise<void> {
  if (!env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: env.SENTRY_DSN,
      tracesSampleRate: 0,
      environment: env.NODE_ENV,
    });
  }
}

export async function onRequestError(
  ...args: Parameters<typeof import("@sentry/nextjs").captureRequestError>
): Promise<void> {
  if (!env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
}
