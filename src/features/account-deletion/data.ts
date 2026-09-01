import "server-only";

import { randomUUID } from "node:crypto";

import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { environment } from "@/lib/env/server";
import { CLEANUP_PROOF_TTL_MS, deletedOwnerHash } from "./cleanup-proof";

import {
  AccountDeletionError,
  deletionJobSchema,
  type DeletionJob,
} from "./domain";
import type { DeletionDependencies } from "./processor";
import { cleanAccountStorage } from "./storage";

export async function readDeletionJob(
  userId: string,
  client = createPrivilegedClient(10_000),
): Promise<DeletionJob | null> {
  const { data, error } = await client
    .from("account_deletion_requests")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new AccountDeletionError("database");
  return data ? deletionJobSchema.parse(data) : null;
}

export async function beginAccountDeletion(
  userId: string,
): Promise<DeletionJob> {
  const { data, error } = await createPrivilegedClient(10_000).rpc(
    "begin_account_deletion",
    { p_user_id: userId },
  );
  if (error) throw new AccountDeletionError("database");
  return deletionJobSchema.parse(data);
}

export async function isAuthAccountAbsent(
  userId: string,
  client = createPrivilegedClient(10_000),
): Promise<boolean> {
  const { data, error } = await client.auth.admin.getUserById(userId);
  if (error) {
    if (
      error.code === "user_not_found" &&
      (error.status === 404 || error.status === 400)
    )
      return true;
    throw new AccountDeletionError("auth");
  }
  if (!data.user) throw new AccountDeletionError("auth");
  return false;
}

export async function verifyOwnedDatabaseRowsAbsent(
  userId: string,
  client = createPrivilegedClient(10_000),
): Promise<boolean> {
  for (const table of [
    "transactions",
    "weekly_insights",
    "ai_request_events",
    "account_storage_activity",
  ]) {
    const { data, error } = await client
      .from(table)
      .select("user_id")
      .eq("user_id", userId)
      .limit(1);
    if (error) throw new AccountDeletionError("database");
    if (data.length) return false;
  }
  return true;
}

export function createDeletionDependencies(): DeletionDependencies {
  const signal = AbortSignal.timeout(30_000);
  const client = createPrivilegedClient(8_000, signal);
  return {
    read: (userId) => readDeletionJob(userId, client),
    async claim(userId) {
      const { data, error } = await client.rpc("claim_account_deletion", {
        p_user_id: userId,
        p_lease_token: randomUUID(),
      });
      if (error || !Array.isArray(data))
        throw new AccountDeletionError("database");
      return data.length ? deletionJobSchema.parse(data[0]) : null;
    },
    cleanStorage: (userId) => cleanAccountStorage(userId, signal),
    async deleteAuth(userId) {
      if (await isAuthAccountAbsent(userId, client)) return;
      await client.auth.admin.deleteUser(userId, false);
      // Always verify. A timeout may mean Auth deletion actually committed.
      const absent = await isAuthAccountAbsent(userId, client);
      if (!absent) throw new AccountDeletionError("auth");
    },
    verifyDatabase: async (userId) =>
      (await isAuthAccountAbsent(userId, client)) &&
      verifyOwnedDatabaseRowsAbsent(userId, client),
    async finish(job) {
      const { error: proofError } = await client
        .from("account_deletion_cleanup_proofs")
        .upsert({
          owner_hash: deletedOwnerHash(
            job.user_id,
            environment.CRON_SECRET ?? "",
          ),
          expires_at: new Date(Date.now() + CLEANUP_PROOF_TTL_MS).toISOString(),
        });
      if (proofError) throw new AccountDeletionError("database");
      const { data, error } = await client
        .from("account_deletion_requests")
        .delete()
        .eq("user_id", job.user_id)
        .eq("request_id", job.request_id)
        .eq("lease_token", job.lease_token)
        .select("user_id");
      if (error) throw new AccountDeletionError("database");
      return data.length === 1;
    },
    async release(job, errorCode) {
      const { error } = await createPrivilegedClient(8_000)
        .from("account_deletion_requests")
        .update({
          lease_token: null,
          lease_until: null,
          last_error_code: errorCode,
          not_before: new Date(
            Date.now() + (errorCode ? 30_000 : 5_000),
          ).toISOString(),
        })
        .eq("user_id", job.user_id)
        .eq("lease_token", job.lease_token);
      if (error) throw new AccountDeletionError("database");
    },
  };
}
