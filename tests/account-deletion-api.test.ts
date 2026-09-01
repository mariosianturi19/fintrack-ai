import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getAccountSession: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/env/server", () => ({
  environment: {
    CRON_SECRET: "test-only-secret-with-at-least-thirty-two-characters",
    SUPABASE_SECRET_KEY: "test-only-server-key",
  },
}));
vi.mock("@/features/account-deletion/data", () => ({
  beginAccountDeletion: vi.fn(),
  createDeletionDependencies: vi.fn(),
  isAuthAccountAbsent: vi.fn(),
  readDeletionJob: vi.fn(),
}));
vi.mock("@/features/account-deletion/processor", () => ({
  processAccountDeletion: vi.fn(),
}));

import { cookies } from "next/headers";
import { GET, POST } from "../src/app/api/account/deletion/route";
import {
  beginAccountDeletion,
  isAuthAccountAbsent,
  readDeletionJob,
} from "../src/features/account-deletion/data";
import { processAccountDeletion } from "../src/features/account-deletion/processor";
import { createDeletionReceipt } from "../src/features/account-deletion/receipt-token";
import { getAccountSession } from "../src/lib/auth/session";
import { createClient } from "../src/lib/supabase/server";
import type { DeletionJob } from "../src/features/account-deletion/domain";

const userId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const job: DeletionJob = {
  user_id: userId,
  request_id: otherId,
  requested_at: "2026-08-27T00:00:00Z",
  not_before: "2026-08-27T00:05:00Z",
  lease_token: null,
  lease_until: null,
  attempts: 0,
  last_error_code: null,
};
const cookieJar = { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
const signOut = vi.fn();
const account = {
  displayName: "Test",
  email: "test@example.invalid",
  initials: "T",
};
function request(
  body: unknown = { action: "request", confirmation: "HAPUS" },
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/account/deletion", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}
function useReceipt() {
  cookieJar.get.mockReturnValue({
    value: createDeletionReceipt(
      userId,
      job.request_id,
      "test-only-secret-with-at-least-thirty-two-characters",
    ),
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(cookies).mockResolvedValue(
    cookieJar as unknown as Awaited<ReturnType<typeof cookies>>,
  );
  vi.mocked(getAccountSession).mockResolvedValue(null);
  vi.mocked(readDeletionJob).mockResolvedValue(null);
  vi.mocked(beginAccountDeletion).mockResolvedValue(job);
  vi.mocked(createClient).mockResolvedValue({
    auth: { signOut },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
});

describe("account deletion API boundary", () => {
  it("rejects cross-origin requests before authentication or mutation", async () => {
    expect(
      (await POST(request(undefined, "https://attacker.invalid"))).status,
    ).toBe(403);
    expect(getAccountSession).not.toHaveBeenCalled();
    expect(beginAccountDeletion).not.toHaveBeenCalled();
  });
  it("does not accept anonymous or browser-selected targets", async () => {
    expect((await POST(request())).status).toBe(401);
    expect(
      (
        await POST(
          request({
            action: "request",
            confirmation: "HAPUS",
            userId: otherId,
          }),
        )
      ).status,
    ).toBe(400);
    expect(beginAccountDeletion).not.toHaveBeenCalled();
  });
  it("accepts only the live session owner and sets a private recovery cookie", async () => {
    vi.mocked(getAccountSession).mockResolvedValue({
      userId,
      account,
      access: "active",
    });
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(beginAccountDeletion).toHaveBeenCalledWith(userId);
    expect(cookieJar.set).toHaveBeenCalledWith(
      "fintrack_deletion",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
    );
    expect(processAccountDeletion).not.toHaveBeenCalled();
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
  it("GET only reports status without starting deletion", async () => {
    vi.mocked(getAccountSession).mockResolvedValue({
      userId,
      account,
      access: "deleting",
    });
    vi.mocked(readDeletionJob).mockResolvedValue(job);
    const response = await GET();
    expect(await response.json()).toMatchObject({ status: "pending" });
    expect(beginAccountDeletion).not.toHaveBeenCalled();
    expect(processAccountDeletion).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });
  it("rejects unauthenticated retry with no valid receipt", async () => {
    cookieJar.get.mockReturnValue({ value: "forged.receipt" });
    expect((await POST(request({ action: "retry" }))).status).toBe(401);
    expect(processAccountDeletion).not.toHaveBeenCalled();
  });
  it("allows recovery after Auth removal but never another request ID", async () => {
    useReceipt();
    vi.mocked(readDeletionJob).mockResolvedValue(job);
    vi.mocked(processAccountDeletion).mockResolvedValue({
      status: "pending",
      retryAfterSeconds: 30,
      retryNeeded: true,
    });
    expect(
      await (await POST(request({ action: "retry" }))).json(),
    ).toMatchObject({ status: "pending", retryNeeded: true });
    expect(signOut).not.toHaveBeenCalled();
    vi.mocked(processAccountDeletion).mockClear();
    vi.mocked(readDeletionJob).mockResolvedValue({
      ...job,
      request_id: userId,
    });
    expect((await POST(request({ action: "retry" }))).status).toBe(401);
    expect(processAccountDeletion).not.toHaveBeenCalled();
  });
  it("does not reuse an old account's receipt after another account logs in", async () => {
    useReceipt();
    vi.mocked(getAccountSession).mockResolvedValue({
      userId: otherId,
      account,
      access: "active",
    });
    expect(await (await POST(request({ action: "retry" }))).json()).toEqual({
      status: "active",
    });
    expect(processAccountDeletion).not.toHaveBeenCalled();
  });
  it("does not infer completion from a missing job while Auth still exists", async () => {
    useReceipt();
    vi.mocked(isAuthAccountAbsent).mockResolvedValue(false);
    expect((await GET()).status).toBe(401);
  });
  it("clears local session and recovery receipt only on confirmed completion", async () => {
    useReceipt();
    vi.mocked(isAuthAccountAbsent).mockResolvedValue(true);
    const response = await POST(request({ action: "retry" }));
    expect(await response.json()).toEqual({ status: "complete" });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
    expect(cookieJar.delete).toHaveBeenCalledWith("fintrack_deletion");
  });
  it("fails closed on database errors without sending sensitive details", async () => {
    vi.mocked(getAccountSession).mockRejectedValue(
      new Error("test-secret-detail"),
    );
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("test-secret-detail");
    expect(beginAccountDeletion).not.toHaveBeenCalled();
  });
});
