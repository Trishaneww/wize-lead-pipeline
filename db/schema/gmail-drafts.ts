// Libs
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Schema
import { leads } from "./leads";
import { outreachDrafts } from "./outreach-drafts";

export const gmailDrafts = pgTable("gmail_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  outreachDraftId: uuid("outreach_draft_id")
    .notNull()
    .references(() => outreachDrafts.id, { onDelete: "cascade" }),
  gmailDraftId: text("gmail_draft_id"), // id returned by Gmail
  createdBy: text("created_by"), // operator email
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
