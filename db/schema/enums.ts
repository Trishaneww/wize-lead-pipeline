// Libs
import { pgEnum } from "drizzle-orm/pg-core";

export const leadSourceEnum = pgEnum("lead_source", ["places", "csv", "manual"]);

export const leadChannelEnum = pgEnum("lead_channel", [
  "web_design",
  "custom_software",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "auditing",
  "qualified",
  "disqualified",
  "drafting",
  "drafted",
  "approved",
  "draft_created",
  "replied",
  "archived",
  "failed",
]);

export const draftStatusEnum = pgEnum("draft_status", [
  "generated",
  "edited",
  "approved",
  "rejected",
]);
