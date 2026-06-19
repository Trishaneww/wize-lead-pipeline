// Next.js
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Libs
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { env } from "@/env";
import { encryptSecret } from "@/lib/helpers/crypto";
import { isEmailAllowed } from "@/lib/queries/accounts";

// Types
import type { Adapter } from "next-auth/adapters";

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.compose";

function encryptingAdapter(): Adapter {
  const base = DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  });
  return {
    ...base,
    linkAccount: (account) => {
      const encrypted = account.refresh_token
        ? { ...account, refresh_token: encryptSecret(account.refresh_token) }
        : account;
      return base.linkAccount?.(encrypted);
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: encryptingAdapter(),
  session: { strategy: "database" },
  trustHost: true,
  secret: env.AUTH_SECRET,
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: `openid email profile ${GMAIL_SCOPE}`,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      return (await isEmailAllowed(email)) ? true : "/login?error=AccessDenied";
    },
  },
});
