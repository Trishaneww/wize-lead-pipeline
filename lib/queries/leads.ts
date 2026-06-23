// Libs
import { and, count, desc, eq, gte, or } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";

// Types
import type { Channel } from "@/constants/channels";

export type LeadRow = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type LeadStatus = LeadRow["status"];

export async function insertLead(values: NewLead): Promise<LeadRow> {
  const [row] = await db.insert(leads).values(values).returning();
  return row;
}

export async function getLeadById(id: string): Promise<LeadRow | undefined> {
  return db.query.leads.findFirst({ where: eq(leads.id, id) });
}

export async function updateLead(
  id: string,
  patch: Partial<NewLead>,
): Promise<LeadRow> {
  const [row] = await db
    .update(leads)
    .set(patch)
    .where(eq(leads.id, id))
    .returning();
  return row;
}

export async function listLeads(): Promise<LeadRow[]> {
  return db.select().from(leads).orderBy(desc(leads.updatedAt));
}

export async function countLeadsCreatedSince(since: Date): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(leads)
    .where(gte(leads.createdAt, since));
  return row?.n ?? 0;
}

export async function findDuplicateLead(
  channel: Channel,
  sourceRef: string | null | undefined,
  websiteUrl: string | null | undefined,
): Promise<LeadRow | undefined> {
  const matchers = [
    sourceRef ? eq(leads.sourceRef, sourceRef) : undefined,
    websiteUrl ? eq(leads.websiteUrl, websiteUrl) : undefined,
  ].filter(Boolean);
  if (matchers.length === 0) return undefined;

  return db.query.leads.findFirst({
    where: and(eq(leads.channel, channel), or(...matchers)),
  });
}
