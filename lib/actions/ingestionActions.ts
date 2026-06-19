"use server";

// Next.js
import { revalidatePath } from "next/cache";

// Libs
import { z } from "zod";
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, placesSourceRequestedData } from "@/constants/events";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { requireOperator } from "@/lib/helpers/auth";

// Types
import type { Channel } from "@/constants/channels";

type RunIngestionResult = { ok: true } | { ok: false; error: string };

export async function runPlacesIngestion(input: {
  niche: string;
  city: string;
  channel?: Channel;
}): Promise<RunIngestionResult> {
  try {
    await requireOperator();
    const data = placesSourceRequestedData.parse({
      niche: input.niche,
      city: input.city,
      channel: input.channel ?? "web_design",
    });

    await inngest.send({ name: EVENTS.placesSourceRequested, data });
    revalidatePath("/leads");

    return { ok: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        error: "Invalid input. Please enter a niche and a city.",
      };
    }
    if (error instanceof AppError) {
      return { ok: false, error: "You're not authorized to start ingestion." };
    }
    
    logger.error({ err: error }, "runPlacesIngestion failed");
    return { ok: false, error: "Could not start ingestion. Try again." };
  }
}
