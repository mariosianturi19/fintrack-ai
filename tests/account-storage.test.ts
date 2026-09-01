import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  environment: {
    CRON_SECRET: "test-only-secret-with-at-least-thirty-two-characters",
  },
}));
vi.mock("@/features/receipts/storage", () => ({
  getReceiptStorageClient: vi.fn(),
}));
vi.mock("@/lib/supabase/privileged", () => ({
  createPrivilegedClient: vi.fn(),
}));

import { getReceiptStorageClient } from "../src/features/receipts/storage";
import { createPrivilegedClient } from "../src/lib/supabase/privileged";
import {
  createStorageCleanupPort,
  cleanAccountStorage,
} from "../src/features/account-deletion/storage";
import {
  createDeletionDependencies,
  isAuthAccountAbsent,
} from "../src/features/account-deletion/data";

const userId = "11111111-1111-4111-8111-111111111111";
const send = vi.fn();
const getUserById = vi.fn();
const deleteUser = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getReceiptStorageClient).mockReturnValue({
    bucket: "test-only-bucket",
    client: { send },
  } as unknown as ReturnType<typeof getReceiptStorageClient>);
  vi.mocked(createPrivilegedClient).mockReturnValue({
    auth: { admin: { getUserById, deleteUser } },
  } as unknown as ReturnType<typeof createPrivilegedClient>);
});

describe("R2 deletion adapter", () => {
  it("treats HTTP 200 with per-object errors as incomplete deletion", async () => {
    send.mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
      Errors: [{ Key: `receipts/${userId}/test.jpg`, Code: "AccessDenied" }],
    });
    await expect(
      createStorageCleanupPort().remove([`receipts/${userId}/test.jpg`]),
    ).rejects.toThrow("storage");
  });
  it("rejects malformed listing results rather than ignoring unknown objects", async () => {
    send.mockResolvedValue({ Contents: [{}] });
    await expect(
      createStorageCleanupPort().list(`receipts/${userId}/`, 100),
    ).rejects.toThrow("storage");
  });
  it("does not interpret network/list failures as an empty bucket", async () => {
    send.mockRejectedValue(new Error("network"));
    await expect(cleanAccountStorage(userId)).rejects.toThrow("storage");
  });
  it("uses explicit bounded owner prefixes and abort signals", async () => {
    send.mockResolvedValue({ Contents: [] });
    expect(await cleanAccountStorage(userId)).toBe(true);
    for (const [command, options] of send.mock.calls) {
      expect(command.input.Bucket).toBe("test-only-bucket");
      expect([`receipts/${userId}/`, `receipts/pending/${userId}/`]).toContain(
        command.input.Prefix,
      );
      expect(command.input.MaxKeys).toBeLessThanOrEqual(100);
      expect(options.abortSignal).toBeInstanceOf(AbortSignal);
    }
  });
});

describe("Auth deletion verification", () => {
  it("recognizes only explicit provider user-not-found responses", async () => {
    getUserById.mockResolvedValue({
      data: { user: null },
      error: { code: "user_not_found", status: 404 },
    });
    expect(await isAuthAccountAbsent(userId)).toBe(true);
  });
  it.each([
    { code: "unavailable", status: 503 },
    { status: 404 },
    { code: "bad_key", status: 401 },
  ])("fails closed on other Auth errors", async (error) => {
    getUserById.mockResolvedValue({ data: { user: null }, error });
    await expect(isAuthAccountAbsent(userId)).rejects.toThrow("auth");
  });
  it("does not treat a malformed success response as account absence", async () => {
    getUserById.mockResolvedValue({ data: { user: null }, error: null });
    await expect(isAuthAccountAbsent(userId)).rejects.toThrow("auth");
  });
  it("verifies an ambiguous deletion response with an independent lookup", async () => {
    getUserById
      .mockResolvedValueOnce({ data: { user: { id: userId } }, error: null })
      .mockResolvedValueOnce({
        data: { user: null },
        error: { code: "user_not_found", status: 404 },
      });
    deleteUser.mockResolvedValue({ error: { status: 503 } });
    await createDeletionDependencies().deleteAuth(userId);
    expect(deleteUser).toHaveBeenCalledWith(userId, false);
    expect(getUserById).toHaveBeenCalledTimes(2);
  });
  it("never reports completion when deleteUser returned success but the user still exists", async () => {
    getUserById.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    deleteUser.mockResolvedValue({ error: null });
    await expect(
      createDeletionDependencies().deleteAuth(userId),
    ).rejects.toThrow("auth");
  });
});
