// Libs
import { z } from "zod";
import { env } from "@/env";
import { PlacesError, PlacesQuotaError } from "@/lib/errors";

// Constants
import { leadInputSchema } from "@/constants/events";

const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";
const FIELD_MASK =
  "places.id,places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.primaryType,nextPageToken";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 2;

const placeSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }).nullish(),
  websiteUri: z.string().nullish(),
  formattedAddress: z.string().nullish(),
  nationalPhoneNumber: z.string().nullish(),
  primaryType: z.string().nullish(),
});

const responseSchema = z.object({
  places: z.array(placeSchema).default([]),
  nextPageToken: z.string().nullish(),
});

export type PlacesBusiness = z.infer<typeof leadInputSchema>;
export async function searchPlaces({
  niche,
  city,
  limit,
}: {
  niche: string;
  city: string;
  limit: number;
}): Promise<PlacesBusiness[]> {
  if (!env.GOOGLE_PLACES_API_KEY) {
    throw new PlacesError("GOOGLE_PLACES_API_KEY is not configured");
  }

  const textQuery = `${niche} in ${city}`;
  const body = JSON.stringify({
    textQuery,
    pageSize: Math.min(Math.max(limit, 1), 20),
    languageCode: "en",
    regionCode: "CA",
  });

  let lastError: PlacesError | null = null;
  let parsed: z.infer<typeof responseSchema> | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask": FIELD_MASK,
        },
        body,
        signal: controller.signal,
      });
    } catch (cause) {
      throw new PlacesError(`Places request failed for "${textQuery}"`, {
        cause,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.ok) {
      parsed = responseSchema.parse(await response.json());
      break;
    }

    if (response.status === 429) {
      throw new PlacesQuotaError(`Places quota exhausted for "${textQuery}"`);
    }

    const detail = await response.text().catch(() => "");
    lastError = new PlacesError(
      `Places returned ${response.status} for "${textQuery}": ${detail.slice(0, 300)}`,
    );

    if (response.status < 500) break;
  }

  if (parsed === null) {
    throw (
      lastError ?? new PlacesError(`Places search failed for "${textQuery}"`)
    );
  }

  return placesToBusinesses(parsed.places, niche, city);
}

type PlaceResult = z.infer<typeof placeSchema>;
export function placesToBusinesses(
  places: PlaceResult[],
  niche: string,
  city: string,
): PlacesBusiness[] {
  return places.flatMap((place) => {
    const businessName = place.displayName?.text;
    if (!businessName) return [];
    return [
      {
        businessName,
        websiteUrl: place.websiteUri ?? null,
        phone: place.nationalPhoneNumber ?? null,
        address: place.formattedAddress ?? null,
        city,
        category: niche,
        email: null,
        sourceRef: place.id,
      },
    ];
  });
}
