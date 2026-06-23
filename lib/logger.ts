// Libs
import pino from "pino";
import { isDev } from "@/env";

const base = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  transport: isDev
    ? { target: "pino-pretty", options: { colorize: true } }
    : undefined,
});

function withSentry(level: "error" | "fatal", original: pino.LogFn): pino.LogFn {
  return ((...args: unknown[]) => {
    if (process.env.SENTRY_DSN) {
      void import("@sentry/nextjs").then((Sentry) => {
        const err = args.find((a) => a instanceof Error);
        if (err) {
          Sentry.captureException(err);
        } else {
          const msg = args.find((a) => typeof a === "string");
          Sentry.captureMessage(typeof msg === "string" ? msg : "log", level);
        }
      });
    }
    return (original as (...a: unknown[]) => unknown)(...args);
  }) as pino.LogFn;
}

base.error = withSentry("error", base.error.bind(base));
base.fatal = withSentry("fatal", base.fatal.bind(base));

export const logger = base;
