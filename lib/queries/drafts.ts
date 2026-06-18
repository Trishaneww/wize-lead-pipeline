// Libs
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { outreachDrafts } from "@/db/schema";

export type DraftRow = typeof outreachDrafts.$inferSelect;
export type NewDraft = typeof outreachDrafts.$inferInsert;

export async function insertDraft(values: NewDraft): Promise<DraftRow> {
  const [row] = await db.insert(outreachDrafts).values(values).returning();
  return row;
}

export async function updateDraft(
  id: string,
  patch: Partial<NewDraft>,
): Promise<DraftRow> {
  const [row] = await db
    .update(outreachDrafts)
    .set(patch)
    .where(eq(outreachDrafts.id, id))
    .returning();
  return row;
}

export async function latestDraftForLead(
  leadId: string,
): Promise<DraftRow | undefined> {
  return db.query.outreachDrafts.findFirst({
    where: eq(outreachDrafts.leadId, leadId),
    orderBy: desc(outreachDrafts.createdAt),
  });
}
