// Next.js
import { serve } from "inngest/next";

// Libs
import { inngest } from "@/lib/clients/inngest";
import { functions } from "@/lib/functions";

export const runtime = "nodejs";
export const maxDuration = 300;

export const { GET, POST, PUT } = serve({ client: inngest, functions });
