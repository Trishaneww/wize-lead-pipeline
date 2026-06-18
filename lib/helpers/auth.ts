// Libs
import { auth } from "@/auth";
import { AppError } from "@/lib/errors";
import { isEmailAllowed } from "@/lib/queries/accounts";

export async function requireOperator(): Promise<{ email: string; userId: string }> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const userId = session?.user?.id;
  if (!email || !userId) {
    throw new AppError("Not authenticated");
  }
  if (!(await isEmailAllowed(email))) {
    throw new AppError("Not authorized");
  }
  return { email, userId };
}
