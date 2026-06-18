// Libs
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { gmailDrafts } from "@/db/schema";

export type GmailDraftRow = typeof gmailDrafts.$inferSelect;
export type NewGmailDraft = typeof gmailDrafts.$inferInsert;

export async function insertGmailDraft(
  values: NewGmailDraft,
): Promise<GmailDraftRow> {
  const [row] = await db.insert(gmailDrafts).values(values).returning();
  return row;
}

export async function gmailDraftForOutreachDraft(
  outreachDraftId: string,
): Promise<GmailDraftRow | undefined> {
  return db.query.gmailDrafts.findFirst({
    where: eq(gmailDrafts.outreachDraftId, outreachDraftId),
  });
}
