// Next.js
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  type CipherGCMTypes,
} from "node:crypto";

// Libs
import { env } from "@/env";
import { AppError, GmailAuthError } from "@/lib/errors";

const ALGORITHM: CipherGCMTypes = "aes-256-gcm";
const IV_BYTES = 12;
const VERSION = "v1";

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    toBase64Url(iv),
    toBase64Url(tag),
    toBase64Url(ciphertext),
  ].join(".");
}

export function decryptSecret(stored: string): string {
  const parts = stored.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new GmailAuthError("Stored secret is malformed");
  }
  const [, ivPart, tagPart, ctPart] = parts;
  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      key(),
      Buffer.from(ivPart, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ctPart, "base64url")),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  } catch (cause) {
    throw new GmailAuthError("Secret decryption failed", { cause });
  }
}

let cachedKey: Buffer | null = null;

function key(): Buffer {
  if (cachedKey) return cachedKey;
  if (!env.TOKEN_ENCRYPTION_KEY) {
    throw new AppError("TOKEN_ENCRYPTION_KEY is not set");
  }
  const decoded = Buffer.from(env.TOKEN_ENCRYPTION_KEY, "base64");
  if (decoded.length !== 32) {
    throw new AppError(
      `TOKEN_ENCRYPTION_KEY must decode to 32 bytes (got ${decoded.length}); generate with \`openssl rand -base64 32\``,
    );
  }
  cachedKey = decoded;
  return decoded;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString("base64url");
}
