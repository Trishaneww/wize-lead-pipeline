// Libs
import { Inngest } from "inngest";
import { env, isDev } from "@/env";

export const inngest = new Inngest({
  id: "wize-lead-pipeline",
  isDev,
  ...(env.INNGEST_SIGNING_KEY ? { signingKey: env.INNGEST_SIGNING_KEY } : {}),
});
