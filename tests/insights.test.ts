import { describe, expect, it } from "vitest";

import type { WeeklyInsightFacts } from "../src/features/insights/domain";
import { createPreviousCompletedWeek } from "../src/features/insights/period";
import {
  createDeterministicWeeklySummary,
  getWeeklyComparison,
} from "../src/features/insights/summary";

const facts: WeeklyInsightFacts = {
  categoryTotals: [
    { amountIdr: 90_000, name: "Makanan & minuman" },
    { amountIdr: 30_000, name: "Transportasi" },
  ],
  previousTotalAmountIdr: 100_000,
  topCategoryAmountIdr: 90_000,
  topCategoryName: "Makanan & minuman",
  totalAmountIdr: 120_000,
  transactionCount: 4,
  userId: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
  weekEnd: "2026-08-16",
  weekStart: "2026-08-10",
};

describe("weekly insight period contract", () => {
  it("uses the last completed Jakarta Monday-to-Sunday week", () => {
    expect(
      createPreviousCompletedWeek(new Date("2026-08-16T17:30:00.000Z")),
    ).toEqual({
      endDate: "2026-08-16",
      endDateExclusive: "2026-08-17",
      startDate: "2026-08-10",
    });
  });

  it("does not treat the current incomplete Jakarta week as completed", () => {
    expect(
      createPreviousCompletedWeek(new Date("2026-08-16T16:30:00.000Z")),
    ).toEqual({
      endDate: "2026-08-09",
      endDateExclusive: "2026-08-10",
      startDate: "2026-08-03",
    });
  });
});

describe("weekly insight deterministic contract", () => {
  it.each([
    [110_000, 100_000, "higher"],
    [109_999, 100_000, "similar"],
    [90_000, 100_000, "lower"],
    [90_001, 100_000, "similar"],
    [100_000, 0, "no_previous_data"],
  ] as const)(
    "classifies %i against %i as %s",
    (current, previous, expected) => {
      expect(getWeeklyComparison(current, previous)).toBe(expected);
    },
  );

  it("creates calm fallback copy from known facts without inventing figures", () => {
    const summary = createDeterministicWeeklySummary(facts);

    expect(summary).toContain("Makanan & minuman");
    expect(summary).toContain("lebih tinggi dari minggu sebelumnya");
    expect(summary).not.toMatch(/120|100|90|30/u);
    expect(summary).not.toContain("karena");
  });
});
