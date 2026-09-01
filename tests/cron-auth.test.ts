import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { isAuthorizedCronRequest } from "../src/features/insights/cron-auth";
import { isSessionOptionalPath } from "../src/lib/supabase/proxy";

const secret = "cron-secret-with-enough-entropy";

function createRequest(authorization?: string) {
  return new Request("http://localhost:3000/api/cron/daily", {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("scheduled operation authorization", () => {
  it("accepts the exact bearer secret", () => {
    expect(
      isAuthorizedCronRequest(createRequest(`Bearer ${secret}`), secret),
    ).toBe(true);
  });

  it.each([
    undefined,
    "",
    secret,
    `Basic ${secret}`,
    `Bearer ${secret}-changed`,
    `bearer ${secret}`,
  ])("rejects a missing or mismatched authorization value", (value) => {
    expect(isAuthorizedCronRequest(createRequest(value), secret)).toBe(false);
  });

  it("fails closed when the server secret is unconfigured", () => {
    expect(
      isAuthorizedCronRequest(createRequest(`Bearer ${secret}`), undefined),
    ).toBe(false);
  });
});

describe("scheduled operation session gate", () => {
  it.each([
    "/api/cron",
    "/api/cron/daily",
    "/api/account/deletion",
    "/account/deletion",
  ])("lets %s reach its bearer-protected route handler", (pathname) => {
    expect(isSessionOptionalPath(pathname)).toBe(true);
  });

  it.each([
    "/api",
    "/api/cronology",
    "/api/receipts/uploads",
    "/api/account/deletion-foreign",
  ])("keeps unrelated API path %s behind the user session gate", (pathname) => {
    expect(isSessionOptionalPath(pathname)).toBe(false);
  });
});

describe("scheduled operation deployment contract", () => {
  it("registers one daily Vercel invocation for the protected route", () => {
    const configuration = JSON.parse(
      readFileSync(join(process.cwd(), "vercel.json"), "utf8"),
    ) as { crons?: Array<{ path?: string; schedule?: string }> };

    expect(configuration.crons).toEqual([
      { path: "/api/cron/daily", schedule: "15 18 * * *" },
    ]);
  });
});
