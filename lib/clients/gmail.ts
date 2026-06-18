// Libs
import { env } from "@/env";
import { GmailAuthError, GmailError } from "@/lib/errors";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DRAFTS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";

export async function exchangeRefreshToken(
  refreshToken: string,
): Promise<{ accessToken: string }> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new GmailAuthError("Google OAuth client is not configured");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    error?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new GmailAuthError(
      `Token refresh failed${data.error ? `: ${data.error}` : ""}`,
    );
  }

  return { accessToken: data.access_token };
}

export async function postDraft(
  accessToken: string,
  rawBase64Url: string,
): Promise<{ id: string }> {
  const res = await fetch(DRAFTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: { raw: rawBase64Url } }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new GmailAuthError("Gmail rejected the access token");
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  if (!res.ok || !data.id) {
    throw new GmailError(`Gmail draft creation failed (HTTP ${res.status})`);
  }

  return { id: data.id };
}
