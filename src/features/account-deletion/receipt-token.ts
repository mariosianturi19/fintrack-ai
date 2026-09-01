import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const DELETION_COOKIE = "fintrack_deletion";
export const DELETION_RECEIPT_TTL_SECONDS = 7 * 24 * 60 * 60;
const receiptSchema = z
  .object({
    userId: z.string().uuid(),
    requestId: z.string().uuid(),
    expiresAt: z.number().int().positive(),
  })
  .strict();
export type DeletionReceipt = z.infer<typeof receiptSchema>;

// Domain-separated signature; the existing server cron secret never leaves
// the server. This receipt authorizes ONLY status/retry for one accepted job.
function sign(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`fintrack-account-deletion-v1:${payload}`)
    .digest();
}
export function createDeletionReceipt(
  userId: string,
  requestId: string,
  secret: string,
  now = Date.now(),
) {
  if (secret.length < 32)
    throw new Error("Deletion receipt signing unavailable.");
  const receipt = receiptSchema.parse({
    userId,
    requestId,
    expiresAt: now + DELETION_RECEIPT_TTL_SECONDS * 1000,
  });
  const payload = Buffer.from(JSON.stringify(receipt)).toString("base64url");
  return `${payload}.${sign(payload, secret).toString("base64url")}`;
}
export function verifyDeletionReceipt(
  token: string | undefined,
  secret: string,
  now = Date.now(),
): DeletionReceipt | null {
  if (!token || token.length > 1024 || secret.length < 32) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  try {
    const expected = sign(parts[0], secret);
    const actual = Buffer.from(parts[1], "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return null;
    const receipt = receiptSchema.parse(
      JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")),
    );
    return receipt.expiresAt > now &&
      receipt.expiresAt <= now + DELETION_RECEIPT_TTL_SECONDS * 1000
      ? receipt
      : null;
  } catch {
    return null;
  }
}
