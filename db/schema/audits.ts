// Libs
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Schema
import { leads } from "./leads";

// Types
import type { AuditFinding, SiteSignals } from "@/types/audits";

export const audits = pgTable("audits", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  reachable: boolean("reachable").notNull().default(true),
  performanceScore: integer("performance_score"),
  lcpMs: integer("lcp_ms"),
  cls: numeric("cls"),
  mobileFriendly: boolean("mobile_friendly"),
  hasHttps: boolean("has_https"),
  hasViewportMeta: boolean("has_viewport_meta"),
  findings: jsonb("findings").$type<AuditFinding[]>(),
  signals: jsonb("signals").$type<SiteSignals>(),
  siteSummary: text("site_summary"),
  visibleText: text("visible_text"),
  screenshotBase64: text("screenshot_base64"),
  rawPagespeed: jsonb("raw_pagespeed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
