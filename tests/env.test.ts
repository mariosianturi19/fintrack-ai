import { describe, expect, it } from "vitest";

import { parseEnvironment } from "../src/lib/env/schema";

describe("environment validation", () => {
  it("provides safe local defaults without external credentials", () => {
    const environment = parseEnvironment({});

    expect(environment.NODE_ENV).toBe("development");
    expect(environment.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(environment.GEMINI_API_KEY).toBeUndefined();
  });

  it("treats empty optional values as unconfigured", () => {
    const environment = parseEnvironment({
      GEMINI_API_KEY: "",
      GEMINI_MODEL: "",
    });

    expect(environment.GEMINI_API_KEY).toBeUndefined();
    expect(environment.GEMINI_MODEL).toBeUndefined();
  });

  it("rejects an incomplete integration configuration", () => {
    expect(() =>
      parseEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase public configuration is incomplete.");
  });

  it("accepts Supabase URL and publishable key as one complete pair", () => {
    const environment = parseEnvironment({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });

    expect(environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      "sb_publishable_example",
    );
  });

  it("accepts a complete R2 configuration", () => {
    const environment = parseEnvironment({
      R2_ACCOUNT_ID: "account-id",
      R2_ACCESS_KEY_ID: "access-key",
      R2_BUCKET_NAME: "fintrack-ai-dev",
      R2_ENDPOINT: "https://account-id.r2.cloudflarestorage.com",
      R2_SECRET_ACCESS_KEY: "secret-key",
    });

    expect(environment.R2_BUCKET_NAME).toBe("fintrack-ai-dev");
  });

  it("accepts server-only scheduled-operation secrets", () => {
    const environment = parseEnvironment({
      CRON_SECRET: "a-random-secret-longer-than-sixteen",
      SUPABASE_SECRET_KEY: "sb_secret_example",
    });

    expect(environment.CRON_SECRET).toBe("a-random-secret-longer-than-sixteen");
    expect(environment.SUPABASE_SECRET_KEY).toBe("sb_secret_example");
  });

  it("rejects a weak cron secret", () => {
    expect(() => parseEnvironment({ CRON_SECRET: "too-short" })).toThrow();
  });
});
