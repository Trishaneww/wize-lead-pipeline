// Libs
import { inngest } from "@/lib/clients/inngest";
import { EVENTS, placesSourceRequestedData } from "@/constants/events";
import { PlacesQuotaError } from "@/lib/errors";
import { searchPlaces } from "@/lib/places";
import { logger } from "@/lib/logger";
import {
  PLACES_INGESTION_CRON,
  PLACES_SEARCH_LIMIT,
  SCHEDULED_PLACES_TARGETS,
} from "@/constants/ingestion";

// Types
import type { Channel } from "@/constants/channels";

interface PlacesTarget {
  channel: Channel;
  niche: string;
  city: string;
  limit?: number;
}

export const sourcePlaces = inngest.createFunction(
  {
    id: "source-places",
    concurrency: { limit: 1 },
    retries: 2,
    onFailure: recordSourcingFailure,
    triggers: [
      { event: EVENTS.placesSourceRequested },
      { cron: PLACES_INGESTION_CRON },
    ],
  },
  async ({ event, step }) => {
    const manual = placesSourceRequestedData.safeParse(event.data);
    const targets: PlacesTarget[] = manual.success
      ? [manual.data]
      : SCHEDULED_PLACES_TARGETS;

    if (targets.length === 0) {
      return { targets: 0, sourced: 0 };
    }

    let sourced = 0;
    for (const [index, target] of targets.entries()) {
      const businesses = await step.run(`search-${index}`, async () => {
        try {
          return await searchPlaces({
            niche: target.niche,
            city: target.city,
            limit: target.limit ?? PLACES_SEARCH_LIMIT,
          });
        } catch (error) {
          if (error instanceof PlacesQuotaError) throw error;
          logger.error(
            { err: error, niche: target.niche, city: target.city },
            "Places search failed for target",
          );

          return [];
        }
      });

      if (businesses.length > 0) {
        sourced += businesses.length;
        await step.sendEvent(`ingest-${index}`, {
          name: EVENTS.ingestRequested,
          data: {
            channel: target.channel,
            source: "places",
            query: `${target.niche} in ${target.city}`,
            businesses,
          },
        });
      }
    }

    return { targets: targets.length, sourced };
  },
);

async function recordSourcingFailure({
  error,
}: {
  error: Error;
}): Promise<void> {
  logger.error({ err: error }, "Places sourcing run failed");
}
