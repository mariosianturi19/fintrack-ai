import { z } from "zod";

import { AccountDeletionError } from "./domain";

export function accountReceiptPrefixes(userId: string): readonly string[] {
  const id = z.string().uuid().parse(userId).toLowerCase();
  return [`receipts/pending/${id}/`, `receipts/${id}/`];
}

export function receiptOwnerFromKey(key: string): string | null {
  const match =
    /^receipts\/(?:pending\/)?([0-9a-f-]{36})\/([0-9a-f-]{36})\.jpg$/i.exec(
      key,
    );
  if (
    !match ||
    !z.string().uuid().safeParse(match[1]).success ||
    !z.string().uuid().safeParse(match[2]).success
  )
    return null;
  return match[1].toLowerCase();
}

export type StorageCleanupPort = {
  list: (
    prefix: string,
    limit: number,
  ) => Promise<{ keys: string[]; truncated: boolean }>;
  remove: (keys: string[]) => Promise<void>;
};

export async function cleanAccountReceiptBatch(
  userId: string,
  storage: StorageCleanupPort,
): Promise<boolean> {
  let empty = true;
  for (const prefix of accountReceiptPrefixes(userId)) {
    const page = await storage.list(prefix, 100);
    if (
      page.keys.some(
        (key) =>
          !key.startsWith(prefix) ||
          key.includes("\\") ||
          /(^|\/)\.\.?($|\/)/.test(key),
      )
    ) {
      throw new AccountDeletionError("storage");
    }
    if (page.truncated && page.keys.length === 0)
      throw new AccountDeletionError("storage");
    if (page.keys.length > 0) await storage.remove(page.keys);
    // Restart at the beginning after deletion: never skip shifted pages.
    const remaining = await storage.list(prefix, 1);
    if (remaining.keys.length > 0 || remaining.truncated) empty = false;
  }
  return empty;
}
