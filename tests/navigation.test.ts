import { describe, expect, it } from "vitest";

import {
  isNavigationItemActive,
  primaryNavigation,
} from "../src/lib/navigation";

describe("primary application navigation", () => {
  it("exposes the Phase 2 destinations locked by the design system", () => {
    expect(primaryNavigation.map((item) => item.label)).toEqual([
      "Dashboard",
      "Transaksi",
      "Scan",
      "Budget",
      "Profil",
    ]);
  });

  it.each([
    ["/", "/", true],
    ["/transactions", "/transactions", true],
    ["/transactions/example", "/transactions", true],
    ["/scan", "/", false],
    ["/profile-settings", "/profile", false],
  ])(
    "matches pathname %s against navigation href %s",
    (pathname, href, expected) => {
      expect(isNavigationItemActive(pathname, href)).toBe(expected);
    },
  );
});
