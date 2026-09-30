import "server-only";

import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

import { getReceiptStorageClient } from "@/features/receipts/storage";

import { AccountDeletionError } from "./domain";
import {
  cleanAccountReceiptBatch,
  type StorageCleanupPort,
} from "./storage-domain";

function isMissingObjectError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  return ["name", "Code", "code"].some(
    (property) =>
      property in error &&
      (error as Record<string, unknown>)[property] === "NoSuchKey",
  );
}

export function createStorageCleanupPort(
  signal = AbortSignal.timeout(20_000),
): StorageCleanupPort {
  const { bucket, client } = getReceiptStorageClient();
  return {
    async list(prefix, limit) {
      const result = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          MaxKeys: limit,
        }),
        { abortSignal: signal },
      );
      const keys = (result.Contents ?? []).map((object) => {
        if (!object.Key) throw new AccountDeletionError("storage");
        return object.Key;
      });
      return { keys, truncated: result.IsTruncated === true };
    },
    async remove(keys) {
      try {
        const result = await client.send(
          new DeleteObjectsCommand({
            Bucket: bucket,
            Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
          }),
          { abortSignal: signal },
        );
        // The desired cleanup state is already satisfied for missing objects.
        // S3-compatible providers may report per-object errors with HTTP 200.
        const failures = (result.Errors ?? []).filter(
          (error) => error.Code !== "NoSuchKey",
        );
        if (failures.length) throw new AccountDeletionError("storage");
      } catch (error) {
        // A single-key reconciliation may race with another cleanup worker.
        // Do not swallow a batch failure because other keys may remain.
        if (keys.length === 1 && isMissingObjectError(error)) return;
        throw error;
      }
    },
  };
}

export async function cleanAccountStorage(
  userId: string,
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    return await cleanAccountReceiptBatch(
      userId,
      createStorageCleanupPort(signal),
    );
  } catch {
    throw new AccountDeletionError("storage");
  }
}

export async function listReceiptReconciliationPage(startAfter: string) {
  const { bucket, client } = getReceiptStorageClient();
  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "receipts/",
      MaxKeys: 100,
      StartAfter: startAfter || undefined,
    }),
    { abortSignal: AbortSignal.timeout(10_000) },
  );
  const keys = (result.Contents ?? []).map((object) => {
    if (!object.Key || !object.Key.startsWith("receipts/"))
      throw new AccountDeletionError("storage");
    return object.Key;
  });
  if (result.IsTruncated && !keys.length)
    throw new AccountDeletionError("storage");
  return { keys, truncated: result.IsTruncated === true };
}
