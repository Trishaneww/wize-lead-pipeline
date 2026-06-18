// Libs
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ingestionRuns } from "@/db/schema";

export type IngestionRunRow = typeof ingestionRuns.$inferSelect;
export type NewIngestionRun = typeof ingestionRuns.$inferInsert;

export async function insertIngestionRun(
  values: NewIngestionRun,
): Promise<IngestionRunRow> {
  const [row] = await db.insert(ingestionRuns).values(values).returning();
  return row;
}

export async function finishIngestionRun(
  id: string,
  patch: Partial<NewIngestionRun>,
): Promise<void> {
  await db.update(ingestionRuns).set(patch).where(eq(ingestionRuns.id, id));
}
