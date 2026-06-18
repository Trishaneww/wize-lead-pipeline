// Libs
import { Inngest } from "inngest";
import { env } from "@/env";

export const inngest = new Inngest({
  id: "wize-lead-pipeline",
  ...(env.INNGEST_SIGNING_KEY ? { signingKey: env.INNGEST_SIGNING_KEY } : {}),
});
