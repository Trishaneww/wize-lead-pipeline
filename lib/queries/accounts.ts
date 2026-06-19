// Libs
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { accounts, users } from "@/db/schema";
import { allowedEmails } from "@/db/schema";

export type AccountRow = typeof accounts.$inferSelect;

export async function getGoogleAccountByEmail(
  email: string,
): Promise<AccountRow | undefined> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (!user) return undefined;
  return db.query.accounts.findFirst({
    where: and(eq(accounts.userId, user.id), eq(accounts.provider, "google")),
  });
}

export async function deleteGoogleAccountByUserId(
  userId: string,
): Promise<void> {
  await db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, "google")));
}

export async function isEmailAllowed(email: string): Promise<boolean> {
  const row = await db.query.allowedEmails.findFirst({
    where: eq(allowedEmails.email, email.toLowerCase()),
  });
  return !!row;
}
