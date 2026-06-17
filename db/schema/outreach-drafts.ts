// Libs
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Schema
import { draftStatusEnum } from "./enums";
import { leads } from "./leads";

export const outreachDrafts = pgTable("outreach_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  subject: text("subject"),
  body: text("body"),
  editedBody: text("edited_body"),
  angle: text("angle"),
  model: text("model"),
  status: draftStatusEnum("status").notNull().default("generated"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
