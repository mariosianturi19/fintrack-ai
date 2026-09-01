import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  AccountDeletionError,
  deletionRequestSchema,
  pendingDeletionStatus,
  type DeletionJob,
} from "../src/features/account-deletion/domain";
import {
  processAccountDeletion,
  type DeletionDependencies,
} from "../src/features/account-deletion/processor";
import {
  createDeletionReceipt,
  DELETION_RECEIPT_TTL_SECONDS,
  verifyDeletionReceipt,
} from "../src/features/account-deletion/receipt-token";
import {
  accountReceiptPrefixes,
  cleanAccountReceiptBatch,
  receiptOwnerFromKey,
  type StorageCleanupPort,
} from "../src/features/account-deletion/storage-domain";

const userId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const requestId = "33333333-3333-4333-8333-333333333333";
const job: DeletionJob = {
  user_id: userId,
  request_id: requestId,
  requested_at: "2026-08-27T00:00:00Z",
  not_before: "2026-08-27T00:05:00Z",
  lease_token: requestId,
  lease_until: null,
  attempts: 1,
  last_error_code: null,
};

function dependencies(): DeletionDependencies {
  return {
    claim: vi.fn().mockResolvedValue(job),
    read: vi.fn().mockResolvedValue(job),
    cleanStorage: vi.fn().mockResolvedValue(true),
    deleteAuth: vi.fn().mockResolvedValue(undefined),
    verifyDatabase: vi.fn().mockResolvedValue(true),
    finish: vi.fn().mockResolvedValue(true),
    release: vi.fn().mockResolvedValue(undefined),
  };
}

describe("account deletion confirmation", () => {
  it("requires exact explicit confirmation and rejects browser targets", () => {
    expect(
      deletionRequestSchema.safeParse({
        action: "request",
        confirmation: "HAPUS",
      }).success,
    ).toBe(true);
    for (const confirmation of ["hapus", " HAPUS", "HAPUS ", "", undefined])
      expect(
        deletionRequestSchema.safeParse({ action: "request", confirmation })
          .success,
      ).toBe(false);
    expect(
      deletionRequestSchema.safeParse({
        action: "request",
        confirmation: "HAPUS",
        userId: otherId,
      }).success,
    ).toBe(false);
    expect(
      deletionRequestSchema.safeParse({ action: "retry", prefix: "receipts/" })
        .success,
    ).toBe(false);
  });
  it("reports the actual drain/lease wait, not fake completion", () => {
    expect(
      pendingDeletionStatus(job, Date.parse("2026-08-27T00:01:00Z")),
    ).toEqual({
      status: "pending",
      retryAfterSeconds: 240,
      retryNeeded: false,
    });
    expect(
      pendingDeletionStatus(
        { ...job, lease_until: "2026-08-27T00:06:00Z" },
        Date.parse("2026-08-27T00:05:00Z"),
      ),
    ).toMatchObject({ retryAfterSeconds: 60 });
  });
});

describe("deletion receipt", () => {
  const secret = "test-only-receipt-secret-with-at-least-32-characters";
  const now = Date.parse("2026-08-27T00:00:00Z");
  it("binds status/retry to one accepted job", () => {
    const receipt = createDeletionReceipt(userId, requestId, secret, now);
    expect(verifyDeletionReceipt(receipt, secret, now)).toEqual({
      userId,
      requestId,
      expiresAt: now + DELETION_RECEIPT_TTL_SECONDS * 1000,
    });
  });
  it("rejects tampering, expired tokens, wrong keys, and malformed input", () => {
    const receipt = createDeletionReceipt(userId, requestId, secret, now);
    const payload = Buffer.from(
      JSON.stringify({ userId: otherId, requestId, expiresAt: now + 1000 }),
    ).toString("base64url");
    expect(
      verifyDeletionReceipt(`${payload}.${receipt.split(".")[1]}`, secret, now),
    ).toBeNull();
    expect(
      verifyDeletionReceipt(
        receipt,
        secret,
        now + DELETION_RECEIPT_TTL_SECONDS * 1000,
      ),
    ).toBeNull();
    expect(verifyDeletionReceipt(receipt, `${secret}wrong`, now)).toBeNull();
    for (const value of [
      undefined,
      "",
      "no.signature",
      `${receipt}.extra`,
      "a".repeat(2000),
    ])
      expect(verifyDeletionReceipt(value, secret, now)).toBeNull();
    expect(() =>
      createDeletionReceipt(userId, requestId, "short", now),
    ).toThrow();
  });
});

describe("bounded account deletion processor", () => {
  it("cleans before Auth, verifies cascades, rechecks storage, then removes its job", async () => {
    const deps = dependencies();
    const calls: string[] = [];
    deps.cleanStorage = vi.fn(async () => {
      calls.push("storage");
      return true;
    });
    deps.deleteAuth = vi.fn(async () => {
      calls.push("auth");
    });
    deps.verifyDatabase = vi.fn(async () => {
      calls.push("database");
      return true;
    });
    deps.finish = vi.fn(async () => {
      calls.push("finish");
      return true;
    });
    expect(await processAccountDeletion(userId, deps)).toEqual({
      status: "complete",
    });
    expect(calls).toEqual(["storage", "auth", "database", "storage", "finish"]);
    expect(deps.deleteAuth).toHaveBeenCalledWith(userId);
  });
  it("does not delete Auth while pages of files remain", async () => {
    const deps = dependencies();
    deps.cleanStorage = vi.fn().mockResolvedValue(false);
    expect(await processAccountDeletion(userId, deps)).toMatchObject({
      status: "pending",
      retryNeeded: false,
    });
    expect(deps.deleteAuth).not.toHaveBeenCalled();
    expect(deps.finish).not.toHaveBeenCalled();
  });
  it.each(["storage", "auth", "database"] as const)(
    "retains the request after a %s failure",
    async (code) => {
      const deps = dependencies();
      if (code === "storage")
        deps.cleanStorage = vi
          .fn()
          .mockRejectedValue(new AccountDeletionError(code));
      if (code === "auth")
        deps.deleteAuth = vi
          .fn()
          .mockRejectedValue(new AccountDeletionError(code));
      if (code === "database")
        deps.verifyDatabase = vi.fn().mockResolvedValue(false);
      expect(await processAccountDeletion(userId, deps)).toMatchObject({
        status: "pending",
        retryNeeded: true,
      });
      expect(deps.finish).not.toHaveBeenCalled();
      expect(deps.release).toHaveBeenCalledWith(job, code);
    },
  );
  it("retains the job when an object appears after Auth deletion", async () => {
    const deps = dependencies();
    deps.cleanStorage = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    expect(await processAccountDeletion(userId, deps)).toMatchObject({
      status: "pending",
    });
    expect(deps.finish).not.toHaveBeenCalled();
  });
  it("never bypasses the durable drain barrier or a concurrent worker lease", async () => {
    const deps = dependencies();
    deps.claim = vi.fn().mockResolvedValue(null);
    expect(await processAccountDeletion(userId, deps)).toMatchObject({
      status: "pending",
    });
    expect(deps.cleanStorage).not.toHaveBeenCalled();
    expect(deps.deleteAuth).not.toHaveBeenCalled();
  });
  it("can safely repeat after the accepted job completed", async () => {
    const deps = dependencies();
    deps.claim = vi.fn().mockResolvedValue(null);
    deps.read = vi.fn().mockResolvedValue(null);
    expect(await processAccountDeletion(userId, deps)).toEqual({
      status: "complete",
    });
    expect(deps.deleteAuth).not.toHaveBeenCalled();
  });
  it("does not claim success if a newer worker owns the job", async () => {
    const deps = dependencies();
    deps.finish = vi.fn().mockResolvedValue(false);
    expect(await processAccountDeletion(userId, deps)).toMatchObject({
      status: "pending",
    });
  });
  it("retries a partial operation without creating another request", async () => {
    const deps = dependencies();
    deps.deleteAuth = vi
      .fn()
      .mockRejectedValueOnce(new AccountDeletionError("auth"))
      .mockResolvedValue(undefined);
    expect(await processAccountDeletion(userId, deps)).toMatchObject({
      status: "pending",
    });
    expect(await processAccountDeletion(userId, deps)).toEqual({
      status: "complete",
    });
    expect(deps.finish).toHaveBeenCalledTimes(1);
  });
});

describe("owner-only receipt cleanup", () => {
  it("constructs two complete UUID prefixes and rejects broad/path input", () => {
    expect(accountReceiptPrefixes(userId)).toEqual([
      `receipts/pending/${userId}/`,
      `receipts/${userId}/`,
    ]);
    for (const id of [
      "",
      "../",
      "receipts/",
      `${userId}/`,
      userId.slice(0, -1),
    ])
      expect(() => accountReceiptPrefixes(id)).toThrow();
  });
  it("recognizes only server-shaped orphan keys", () => {
    expect(
      receiptOwnerFromKey(`receipts/pending/${userId}/${requestId}.jpg`),
    ).toBe(userId);
    expect(receiptOwnerFromKey(`receipts/${userId}/${requestId}.jpg`)).toBe(
      userId,
    );
    for (const key of [
      `receipts/${userId}/../${requestId}.jpg`,
      `receipts/${userId}/file.jpg`,
      `other/${userId}/${requestId}.jpg`,
    ])
      expect(receiptOwnerFromKey(key)).toBeNull();
  });
  it("processes bounded pages without skipping objects after deletes", async () => {
    const objects = new Set(
      Array.from(
        { length: 240 },
        (_, index) => `receipts/pending/${userId}/test-${index}.jpg`,
      ),
    );
    objects.add(`receipts/${otherId}/keep.jpg`);
    const port: StorageCleanupPort = {
      list: vi.fn(async (prefix, limit) => {
        const keys = [...objects].filter((key) => key.startsWith(prefix));
        return { keys: keys.slice(0, limit), truncated: keys.length > limit };
      }),
      remove: vi.fn(async (keys: string[]) => {
        keys.forEach((key) => objects.delete(key));
      }),
    };
    expect(await cleanAccountReceiptBatch(userId, port)).toBe(false);
    expect(await cleanAccountReceiptBatch(userId, port)).toBe(false);
    expect(await cleanAccountReceiptBatch(userId, port)).toBe(true);
    expect([...objects]).toEqual([`receipts/${otherId}/keep.jpg`]);
  });
  it("fails closed before deleting an unexpected listed prefix", async () => {
    const port: StorageCleanupPort = {
      list: vi.fn().mockResolvedValue({
        keys: [`receipts/${otherId}/keep.jpg`],
        truncated: false,
      }),
      remove: vi.fn(),
    };
    await expect(cleanAccountReceiptBatch(userId, port)).rejects.toThrow(
      "storage",
    );
    expect(port.remove).not.toHaveBeenCalled();
  });
  it("does not swallow partial storage deletion failure", async () => {
    const port: StorageCleanupPort = {
      list: vi.fn().mockResolvedValue({
        keys: [`receipts/pending/${userId}/test.jpg`],
        truncated: false,
      }),
      remove: vi.fn().mockRejectedValue(new AccountDeletionError("storage")),
    };
    await expect(cleanAccountReceiptBatch(userId, port)).rejects.toThrow(
      "storage",
    );
  });
});

describe("CP10 migration security contract", () => {
  const sql = readFileSync(
    join(
      process.cwd(),
      "supabase/migrations/20260827100000_f1_cp10_account_deletion.sql",
    ),
    "utf8",
  );
  it("keeps recovery records after Auth removal without storing account content", () => {
    const table = sql
      .split("create table public.account_deletion_requests (")[1]
      .split("\n);")[0];
    expect(table).not.toContain("references auth.users");
    expect(table).not.toMatch(/\b(email|merchant|summary|receipt_items)\b/);
    expect(sql).toContain(
      "alter table public.account_deletion_requests enable row level security",
    );
  });
  it("guards every owned data table, serializes storage issuance, and checks live sessions", () => {
    for (const name of [
      "transactions",
      "weekly_insights",
      "ai_request_events",
    ]) {
      expect(sql).toContain(`on public.${name} as restrictive`);
      expect(sql).toContain(`create trigger ${name}_account_write_guard`);
    }
    expect(sql).toContain("from auth.sessions s join auth.users");
    expect(sql).toContain("pg_advisory_xact_lock_shared");
    expect(sql).toContain("pg_advisory_xact_lock(");
    expect(sql).toContain("from public, anon, authenticated;");
  });
});
