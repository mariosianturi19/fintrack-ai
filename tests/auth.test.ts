import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { createAccountSummary } from "../src/lib/auth/account";
import {
  createLoginPath,
  getSafeRedirectPath,
} from "../src/lib/auth/redirects";
import { parseSupabasePublicEnvironment } from "../src/lib/supabase/environment";

describe("authentication boundaries", () => {
  it("explains Google sign-up without claiming beta-only access", () => {
    const loginPage = readFileSync(
      new URL("../src/app/login/page.tsx", import.meta.url),
      "utf8",
    );

    expect(loginPage).toContain("Masuk atau daftar");
    expect(loginPage).toContain("Selamat datang di Fintrack AI");
    expect(loginPage).toContain("Akun baru dibuat otomatis");
    expect(loginPage).toContain(
      "Gunakan akun Google untuk membuka ruang kerja keuanganmu.",
    );
    expect(loginPage).not.toMatch(/beta testing|test user|Akses terbatas/i);
    expect(loginPage).toContain("<form action={signInWithGoogle}");
    expect(loginPage).toContain("<GoogleSignInButton />");
  });

  it.each([
    ["/transactions?period=july", "/transactions?period=july"],
    ["/profile#security", "/profile#security"],
    ["https://attacker.example", "/"],
    ["//attacker.example", "/"],
    ["/\\attacker.example", "/"],
    ["transactions", "/"],
    [undefined, "/"],
  ])("sanitizes redirect target %s", (value, expected) => {
    expect(getSafeRedirectPath(value)).toBe(expected);
  });

  it("creates login URLs without dropping a safe destination", () => {
    expect(
      createLoginPath({
        error: "callback_failed",
        next: "/transactions?period=july",
      }),
    ).toBe("/login?error=callback_failed&next=%2Ftransactions%3Fperiod%3Djuly");
  });

  it("derives display-only account identity from verified claims", () => {
    expect(
      createAccountSummary({
        email: "mario@example.com",
        user_metadata: {
          full_name: "Mario Sianturi",
        },
      }),
    ).toEqual({
      displayName: "Mario Sianturi",
      email: "mario@example.com",
      initials: "MS",
    });
  });

  it("requires both Supabase public environment values at runtime", () => {
    expect(() =>
      parseSupabasePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toThrow("Supabase publishable key belum dikonfigurasi.");

    expect(
      parseSupabasePublicEnvironment({
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      }),
    ).toEqual({
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    });
  });
});
