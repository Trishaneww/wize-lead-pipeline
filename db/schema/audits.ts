// Libs
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Schema
import { leads } from "./leads";

// Types
import type { AuditFinding } from "@/types/audits";

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  performanceScore: integer("performance_score"),
  lcpMs: integer("lcp_ms"),
  cls: numeric("cls"),
  mobileFriendly: boolean("mobile_friendly"),
  hasHttps: boolean("has_https"),
  hasViewportMeta: boolean("has_viewport_meta"),
  findings: jsonb("findings").$type<AuditFinding[]>(),
  rawPagespeed: jsonb("raw_pagespeed"), // full API response for reference
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
