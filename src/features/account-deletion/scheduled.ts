import "server-only";

import { z } from "zod";

import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { environment } from "@/lib/env/server";
import { deletedOwnerHash } from "./cleanup-proof";

import {
  createDeletionDependencies,
  isAuthAccountAbsent,
  verifyOwnedDatabaseRowsAbsent,
} from "./data";
import { AccountDeletionError } from "./domain";
import { processAccountDeletion } from "./processor";
import {
  createStorageCleanupPort,
  listReceiptReconciliationPage,
} from "./storage";
import { receiptOwnerFromKey } from "./storage-domain";

export async function processScheduledDeletions() {
  const client = createPrivilegedClient(10_000);
  const { data, error } = await client
    .from("account_deletion_requests")
    .select("user_id")
    .lte("not_before", new Date().toISOString())
    .order("not_before")
    .limit(3);
  if (error) throw new AccountDeletionError("database");
  const users = z.array(z.object({ user_id: z.string().uuid() })).parse(data);
  const result = { completedCount: 0, pendingCount: 0, failedCount: 0 };
  const deadline = Date.now() + 25_000;
  for (const { user_id: userId } of users) {
    if (Date.now() >= deadline) break;
    try {
      const status = await processAccountDeletion(
        userId,
        createDeletionDependencies(),
      );
      if (status.status === "complete") result.completedCount += 1;
      else {
        result.pendingCount += 1;
        if (status.status === "pending" && status.retryNeeded)
          result.failedCount += 1;
      }
    } catch {
      result.failedCount += 1;
    }
  }
  return result;
}

// Presigned PUT expiry blocks NEW requests, not a transfer already in flight.
// A fresh HMAC deletion proof, absent Auth account, AND absent application rows
// are mandatory. Unknown accounts in a bucket are NOT deletion authorization;
// errors never mean "missing". The cursor bounds each daily run to 100 keys.
export async function reconcileDeletedAccountReceipts() {
  const client = createPrivilegedClient(10_000);
  const { error: expiredProofError } = await client
    .from("account_deletion_cleanup_proofs")
    .delete()
    .lte("expires_at", new Date().toISOString());
  if (expiredProofError) throw new AccountDeletionError("database");
  const { data, error } = await client
    .from("maintenance_cursors")
    .select("value")
    .eq("name", "receipt_orphans")
    .single();
  if (error) throw new AccountDeletionError("database");
  const cursor = z.object({ value: z.string() }).parse(data).value;
  const page = await listReceiptReconciliationPage(cursor);
  const absent = new Map<string, boolean>();
  let lastScanned = cursor;
  let removedCount = 0;
  const deadline = Date.now() + 15_000;
  for (const key of page.keys) {
    if (Date.now() >= deadline) break;
    const owner = receiptOwnerFromKey(key);
    if (owner) {
      if (!absent.has(owner)) {
        const { data: proof, error: proofError } = await client
          .from("account_deletion_cleanup_proofs")
          .select("expires_at")
          .eq(
            "owner_hash",
            deletedOwnerHash(owner, environment.CRON_SECRET ?? ""),
          )
          .maybeSingle();
        if (proofError) throw new AccountDeletionError("database");
        const validProof =
          proof &&
          z.string().datetime({ offset: true }).safeParse(proof.expires_at)
            .success &&
          new Date(proof.expires_at).getTime() > Date.now();
        absent.set(
          owner,
          Boolean(validProof) &&
            (await isAuthAccountAbsent(owner)) &&
            (await verifyOwnedDatabaseRowsAbsent(owner)),
        );
      }
      if (absent.get(owner)) {
        // Only this exact, validated owner key is removed; never bucket-wide.
        await createStorageCleanupPort().remove([key]);
        removedCount += 1;
      }
    }
    lastScanned = key;
  }
  const reachedEnd =
    !page.truncated && (!page.keys.length || lastScanned === page.keys.at(-1));
  // CAS: overlapping cron requests may duplicate work, but cannot skip progress.
  const { error: cursorError } = await client
    .from("maintenance_cursors")
    .update({ value: reachedEnd ? "" : lastScanned })
    .eq("name", "receipt_orphans")
    .eq("value", cursor);
  if (cursorError) throw new AccountDeletionError("database");
  return { removedCount };
}
