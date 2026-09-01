import { createHmac } from "node:crypto";
import { z } from "zod";

export const CLEANUP_PROOF_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function deletedOwnerHash(userId: string, secret: string) {
  if (secret.length < 32) throw new Error("Cleanup proof signing unavailable.");
  const owner = z.string().uuid().parse(userId).toLowerCase();
  return createHmac("sha256", secret)
    .update(`fintrack-deleted-owner-v1:${owner}`)
    .digest("hex");
}
