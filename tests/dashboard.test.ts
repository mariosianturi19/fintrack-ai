import { describe, expect, it } from "vitest";

import {
  createDashboardPeriod,
  createDashboardSnapshot,
} from "../src/features/dashboard/aggregate";
import type {
  TransactionCategory,
  TransactionRecord,
} from "../src/features/transactions/domain";

const foodCategory: TransactionCategory = {
  colorHex: "#D96C52",
  id: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
  isActive: true,
  name: "Makanan & minuman",
  slug: "food-drink",
  sortOrder: 10,
};

const shoppingCategory: TransactionCategory = {
  colorHex: "#8A6FA8",
  id: "f1d6fdc8-3c9d-4a89-a08b-85f4814417be",
  isActive: true,
  name: "Belanja",
  slug: "shopping",
  sortOrder: 30,
};

function createTransaction(
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  return {
    amountIdr: 50_000,
    category: foodCategory,
    categoryId: foodCategory.id,
    createdAt: "2026-08-01T02:00:00.000Z",
    id: crypto.randomUUID(),
    merchant: null,
    notes: "Makan siang",
    receiptItems: [],
    receiptObjectKey: null,
    source: "manual",
    transactionDate: "2026-08-01",
    updatedAt: "2026-08-01T02:00:00.000Z",
    ...overrides,
  };
}

describe("dashboard period contract", () => {
  it("uses Asia/Jakarta for the active month and Monday week boundary", () => {
    const period = createDashboardPeriod(new Date("2026-07-31T18:30:00.000Z"));

    expect(period).toEqual({
      endDateExclusive: "2026-09-01",
      label: "Agustus 2026",
      queryStartDate: "2026-07-27",
      startDate: "2026-08-01",
      today: "2026-08-01",
      weekStartDate: "2026-07-27",
    });
  });
});

describe("dashboard aggregation contract", () => {
  it("separates active-month total from a week crossing month boundaries", () => {
    const period = createDashboardPeriod(new Date("2026-07-31T18:30:00.000Z"));
    const julyTransaction = createTransaction({
      amountIdr: 20_000,
      transactionDate: "2026-07-30",
    });
    const augustTransactions = [
      createTransaction({ amountIdr: 80_000 }),
      createTransaction({
        amountIdr: 120_000,
        category: shoppingCategory,
        categoryId: shoppingCategory.id,
      }),
    ];
    const snapshot = createDashboardSnapshot(
      [julyTransaction, ...augustTransactions],
      augustTransactions,
      period,
    );

    expect(snapshot.totalAmountIdr).toBe(200_000);
    expect(snapshot.weeklyAmountIdr).toBe(220_000);
    expect(snapshot.weeklySharePercentage).toBe(110);
    expect(snapshot.transactionCount).toBe(2);
    expect(
      snapshot.categories.map(({ name, percentage }) => [name, percentage]),
    ).toEqual([
      ["Belanja", 60],
      ["Makanan & minuman", 40],
    ]);
  });

  it("returns a stable empty snapshot without fabricated values", () => {
    const period = createDashboardPeriod(new Date("2026-08-01T03:00:00.000Z"));
    const snapshot = createDashboardSnapshot([], [], period);

    expect(snapshot).toMatchObject({
      categories: [],
      recentTransactions: [],
      totalAmountIdr: 0,
      transactionCount: 0,
      weeklyAmountIdr: 0,
      weeklySharePercentage: 0,
    });
  });
});
