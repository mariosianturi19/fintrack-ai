import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { createClient } from "../src/lib/supabase/server";
import {
  getAccountSession,
  getAuthenticatedAccount,
  getAuthenticatedUserId,
} from "../src/lib/auth/session";

const getClaims = vi.fn();
const getUser = vi.fn();
const rpc = vi.fn();
const userId = "11111111-1111-4111-8111-111111111111";
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { getClaims, getUser },
    rpc,
  } as unknown as Awaited<ReturnType<typeof createClient>>);
  getClaims.mockResolvedValue({
    data: { claims: { sub: userId } },
    error: null,
  });
  getUser.mockResolvedValue({
    data: { user: { id: userId, email: "test@example.invalid" } },
    error: null,
  });
  rpc.mockResolvedValue({ data: "active", error: null });
});
describe("live account/session authorization", () => {
  it("accepts active current users with a live database session", async () => {
    expect(await getAuthenticatedUserId()).toBe(userId);
    expect(rpc).toHaveBeenCalledWith("get_account_access_state");
  });
  it("rejects still-signed JWTs when Auth user no longer exists", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: { status: 404 } });
    expect(await getAuthenticatedUserId()).toBeNull();
    expect(rpc).not.toHaveBeenCalled();
  });
  it("rejects a revoked session even if its Auth user still exists", async () => {
    rpc.mockResolvedValue({ data: "signed_out", error: null });
    expect(await getAuthenticatedUserId()).toBeNull();
  });
  it("permits deletion recovery but blocks application helpers while pending", async () => {
    rpc.mockResolvedValue({ data: "deleting", error: null });
    expect(await getAccountSession()).toMatchObject({
      userId,
      access: "deleting",
    });
    expect(await getAuthenticatedUserId()).toBeNull();
    expect(await getAuthenticatedAccount()).toBeNull();
  });
  it("does not fall back to claims on migration/database failure", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "unavailable" } });
    await expect(getAuthenticatedUserId()).rejects.toThrow(
      "verification unavailable",
    );
  });
});
