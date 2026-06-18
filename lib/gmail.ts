// Libs
import { exchangeRefreshToken, postDraft } from "@/lib/clients/gmail";
import { GmailAuthError } from "@/lib/errors";
import { decryptSecret } from "@/lib/helpers/crypto";
import { getGoogleAccountByEmail } from "@/lib/queries/accounts";

interface CreateGmailDraftInput {
  to: string;
  subject: string;
  body: string;
  operatorEmail: string;
}

export async function createGmailDraft(
  input: CreateGmailDraftInput,
): Promise<{ gmailDraftId: string }> {
  const account = await getGoogleAccountByEmail(input.operatorEmail);
  if (!account?.refresh_token) {
    throw new GmailAuthError("Gmail is not connected for this operator");
  }
  const refreshToken = decryptSecret(account.refresh_token);
  const { accessToken } = await exchangeRefreshToken(refreshToken);
  const raw = buildRawMessage({
    to: input.to,
    from: input.operatorEmail,
    subject: input.subject,
    body: input.body,
  });
  const { id } = await postDraft(accessToken, raw);
  return { gmailDraftId: id };
}

interface RawMessageInput {
  to: string;
  from: string;
  subject: string;
  body: string;
}

function buildRawMessage({ to, from, subject, body }: RawMessageInput): string {
  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${encodeSubject(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];
  const message = `${headers.join("\r\n")}\r\n\r\n${body}`;
  return Buffer.from(message, "utf8").toString("base64url");
}

function encodeSubject(subject: string): string {
  if (/^[\x20-\x7e]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}
