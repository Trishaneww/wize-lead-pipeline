// Libs
import { Inngest } from "inngest";
import { env, isDev } from "@/env";
import { SentryMiddleware } from "@/lib/sentryInngest";

export const inngest = new Inngest({
  id: "wize-lead-pipeline",
  isDev,
  middleware: [SentryMiddleware],
  ...(env.INNGEST_SIGNING_KEY ? { signingKey: env.INNGEST_SIGNING_KEY } : {}),
});
