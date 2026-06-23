// Libs
import { Middleware } from "inngest";

export class SentryMiddleware extends Middleware.BaseMiddleware {
  readonly id = "sentry-capture";

  async onRunError({
    error,
    fn,
    isFinalAttempt,
  }: Middleware.OnRunErrorArgs): Promise<void> {
    if (!process.env.SENTRY_DSN) return;
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error, {
      tags: { inngestFn: fn.id(), isFinalAttempt },
    });
  }
}
