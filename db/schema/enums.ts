// Libs
import { pgEnum } from "drizzle-orm/pg-core";

// Constants
import {
  DRAFT_STATUSES,
  LEAD_CHANNELS,
  LEAD_SOURCES,
  LEAD_STATUSES,
} from "@/constants/enums";

export const leadSourceEnum = pgEnum("lead_source", LEAD_SOURCES);

export const leadChannelEnum = pgEnum("lead_channel", LEAD_CHANNELS);

export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES);

export const draftStatusEnum = pgEnum("draft_status", DRAFT_STATUSES);
