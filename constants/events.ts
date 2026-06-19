// Libs
import { z } from "zod";

// Constants
import { LEAD_CHANNELS, LEAD_SOURCES } from "@/constants/enums";

export const EVENTS = {
  ingestRequested: "lead/ingest.requested",
  placesSourceRequested: "lead/places.source.requested",
  leadCreated: "lead/created",
  leadAudited: "lead/audited",
  leadQualified: "lead/qualified",
} as const;

export const leadInputSchema = z.object({
  businessName: z.string().min(1),
  websiteUrl: z.string().nullish(),
  city: z.string().nullish(),
  category: z.string().nullish(),
  email: z.string().nullish(),
  phone: z.string().nullish(),
  address: z.string().nullish(),
  sourceRef: z.string().nullish(),
});

export const channelSchema = z.enum(LEAD_CHANNELS);

export const ingestRequestedData = z.object({
  channel: channelSchema,
  source: z.enum(LEAD_SOURCES).default("manual"),
  query: z.string().nullish(),
  businesses: z.array(leadInputSchema).min(1),
});

export const placesSourceRequestedData = z.object({
  channel: channelSchema.default("web_design"),
  niche: z.string().min(1),
  city: z.string().min(1),
  limit: z.number().int().positive().max(20).optional(),
});

export const leadRefData = z.object({ leadId: z.uuid() });

export const leadQualifiedData = z.object({
  leadId: z.uuid(),
  angle: z.string().min(1),
  reasoning: z.string().min(1),
});
