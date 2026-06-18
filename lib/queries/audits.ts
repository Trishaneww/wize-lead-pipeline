// Libs
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { audits } from "@/db/schema";
import { EMPTY_SIGNALS } from "@/constants/audit";

// Types
import type { SiteAuditResult } from "@/types/audits";

export type AuditRow = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;

export async function insertAudit(values: NewAudit): Promise<AuditRow> {
  const [row] = await db.insert(audits).values(values).returning();
  return row;
}

export async function latestAuditForLead(
  leadId: string,
): Promise<AuditRow | undefined> {
  return db.query.audits.findFirst({
    where: eq(audits.leadId, leadId),
    orderBy: desc(audits.createdAt),
  });
}

export function auditRowToResult(row: AuditRow): SiteAuditResult {
  return {
    reachable: row.reachable,
    hasHttps: row.hasHttps ?? false,
    hasViewportMeta: row.hasViewportMeta ?? false,
    mobileFriendly: row.mobileFriendly,
    performanceScore: row.performanceScore,
    lcpMs: row.lcpMs,
    cls: row.cls !== null ? Number(row.cls) : null,
    findings: row.findings ?? [],
    signals: row.signals ?? EMPTY_SIGNALS,
    siteSummary: row.siteSummary ?? "",
    visibleText: row.visibleText ?? "",
    screenshotBase64: row.screenshotBase64,
    rawPagespeed: row.rawPagespeed,
  };
}

export function auditResultToRow(
  leadId: string,
  audit: SiteAuditResult,
): NewAudit {
  return {
    leadId,
    reachable: audit.reachable,
    hasHttps: audit.hasHttps,
    hasViewportMeta: audit.hasViewportMeta,
    mobileFriendly: audit.mobileFriendly,
    performanceScore: audit.performanceScore,
    lcpMs: audit.lcpMs,
    cls: audit.cls !== null ? String(audit.cls) : null,
    findings: audit.findings,
    signals: audit.signals,
    siteSummary: audit.siteSummary,
    visibleText: audit.visibleText,
    screenshotBase64: audit.screenshotBase64,
    rawPagespeed: audit.rawPagespeed,
  };
}
