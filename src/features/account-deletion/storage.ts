import "server-only";

import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

import { getReceiptStorageClient } from "@/features/receipts/storage";

import { AccountDeletionError } from "./domain";
import {
  cleanAccountReceiptBatch,
  type StorageCleanupPort,
} from "./storage-domain";

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
      const result = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
        }),
        { abortSignal: signal },
      );
      // S3 can return HTTP 200 with individual deletion errors.
      if (result.Errors?.length) throw new AccountDeletionError("storage");
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
