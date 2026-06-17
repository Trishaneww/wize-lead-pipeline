// Libs
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Schema
import { leadChannelEnum, leadSourceEnum, leadStatusEnum } from "./enums";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  channel: leadChannelEnum("channel").notNull().default("web_design"),
  businessName: text("business_name").notNull(),
  websiteUrl: text("website_url"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  category: text("category"),
  source: leadSourceEnum("source").notNull(),
  sourceRef: text("source_ref"), 
  status: leadStatusEnum("status").notNull().default("new"),
  qualificationScore: integer("qualification_score"), 
  disqualifiedReason: text("disqualified_reason"),
  failureReason: text("failure_reason"), 
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
