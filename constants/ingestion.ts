// Types
import type { Channel } from "@/constants/channels";

// Scheduled Places sourcing cadence (cron, UTC). 09:00 UTC on weekdays.
export const PLACES_INGESTION_CRON = "0 9 * * 1-5";
export const PLACES_SEARCH_LIMIT = 20;
export const MAX_LEADS_PER_DAY = 200;

export const SCHEDULED_PLACES_TARGETS: Array<{
  channel: Channel;
  niche: string;
  city: string;
}> = [
  // { channel: "web_design", niche: "dentist", city: "Hamilton, ON" },
  // { channel: "web_design", niche: "law firm", city: "Burlington, ON" },
];
