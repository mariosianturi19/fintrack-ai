import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  environment: {
    CRON_SECRET: "test-only-secret-with-at-least-thirty-two-characters",
  },
}));
vi.mock("@/lib/supabase/privileged", () => ({
  createPrivilegedClient: vi.fn(),
}));
vi.mock("@/features/account-deletion/storage", () => ({
  createStorageCleanupPort: vi.fn(),
  listReceiptReconciliationPage: vi.fn(),
}));
vi.mock("@/features/account-deletion/data", () => ({
  createDeletionDependencies: vi.fn(),
  isAuthAccountAbsent: vi.fn(),
  verifyOwnedDatabaseRowsAbsent: vi.fn(),
}));

import { createPrivilegedClient } from "../src/lib/supabase/privileged";
import {
  isAuthAccountAbsent,
  verifyOwnedDatabaseRowsAbsent,
} from "../src/features/account-deletion/data";
import {
  createStorageCleanupPort,
  listReceiptReconciliationPage,
} from "../src/features/account-deletion/storage";
import { reconcileDeletedAccountReceipts } from "../src/features/account-deletion/scheduled";
import { deletedOwnerHash } from "../src/features/account-deletion/cleanup-proof";

const owner = "11111111-1111-4111-8111-111111111111";
const key = `receipts/pending/${owner}/22222222-2222-4222-8222-222222222222.jpg`;
const proof = vi.fn();
const remove = vi.fn();
const expire = vi.fn();
const advance = vi.fn();
const proofKey = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  expire.mockResolvedValue({ error: null });
  advance.mockResolvedValue({ error: null });
  proof.mockResolvedValue({ data: null, error: null });
  proofKey.mockReturnValue({ maybeSingle: proof });
  const from = (table: string) =>
    table === "account_deletion_cleanup_proofs"
      ? {
          delete: () => ({ lte: expire }),
          select: () => ({ eq: proofKey }),
        }
      : {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { value: "" }, error: null }),
            }),
          }),
          update: () => ({ eq: () => ({ eq: advance }) }),
        };
  vi.mocked(createPrivilegedClient).mockReturnValue({
    from,
  } as unknown as ReturnType<typeof createPrivilegedClient>);
  vi.mocked(createStorageCleanupPort).mockReturnValue({
    remove,
    list: vi.fn(),
  });
  vi.mocked(listReceiptReconciliationPage).mockResolvedValue({
    keys: [key],
    truncated: false,
  });
  vi.mocked(isAuthAccountAbsent).mockResolvedValue(true);
  vi.mocked(verifyOwnedDatabaseRowsAbsent).mockResolvedValue(true);
});

describe("authorized late-object reconciliation", () => {
  it("does not delete unknown owners just because Auth may be missing", async () => {
    expect(await reconcileDeletedAccountReceipts()).toEqual({
      removedCount: 0,
    });
    expect(isAuthAccountAbsent).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it("does not use expired deletion proofs", async () => {
    proof.mockResolvedValue({
      data: { expires_at: new Date(Date.now() - 1000).toISOString() },
      error: null,
    });
    expect(await reconcileDeletedAccountReceipts()).toEqual({
      removedCount: 0,
    });
    expect(remove).not.toHaveBeenCalled();
    expect(expire).toHaveBeenCalledWith("expires_at", expect.any(String));
  });
  it("requires both authorized proof and independently verified absence", async () => {
    proof.mockResolvedValue({
      data: { expires_at: new Date(Date.now() + 100_000).toISOString() },
      error: null,
    });
    vi.mocked(isAuthAccountAbsent).mockResolvedValue(false);
    expect(await reconcileDeletedAccountReceipts()).toEqual({
      removedCount: 0,
    });
    expect(remove).not.toHaveBeenCalled();
  });
  it("removes only the exact approved owner key and advances the cursor", async () => {
    proof.mockResolvedValue({
      data: { expires_at: new Date(Date.now() + 100_000).toISOString() },
      error: null,
    });
    expect(await reconcileDeletedAccountReceipts()).toEqual({
      removedCount: 1,
    });
    expect(remove).toHaveBeenCalledWith([key]);
    expect(proofKey).toHaveBeenCalledWith(
      "owner_hash",
      deletedOwnerHash(
        owner,
        "test-only-secret-with-at-least-thirty-two-characters",
      ),
    );
    expect(advance).toHaveBeenCalled();
  });
  it("does not turn an Auth failure into deletion or skip its cursor", async () => {
    proof.mockResolvedValue({
      data: { expires_at: new Date(Date.now() + 100_000).toISOString() },
      error: null,
    });
    vi.mocked(isAuthAccountAbsent).mockRejectedValue(new Error("unavailable"));
    await expect(reconcileDeletedAccountReceipts()).rejects.toThrow(
      "unavailable",
    );
    expect(remove).not.toHaveBeenCalled();
    expect(advance).not.toHaveBeenCalled();
  });
  it("uses a keyed proof with no raw identifier and separates other owners/keys", () => {
    const secret = "test-only-secret-with-at-least-thirty-two-characters";
    expect(deletedOwnerHash(owner, secret)).toMatch(/^[a-f0-9]{64}$/);
    expect(deletedOwnerHash(owner, secret)).not.toContain(owner);
    expect(deletedOwnerHash(owner, secret)).not.toBe(
      deletedOwnerHash("22222222-2222-4222-8222-222222222222", secret),
    );
    expect(deletedOwnerHash(owner, secret)).not.toBe(
      deletedOwnerHash(owner, `${secret}-other-environment`),
    );
  });
});
