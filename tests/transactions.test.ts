import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  TransactionCategory,
  TransactionRecord,
} from "../src/features/transactions/domain";
import {
  formatExpenseIdr,
  formatIdr,
  getJakartaDateInputValue,
  getTransactionPrimaryLabel,
  groupTransactionsByDate,
} from "../src/features/transactions/format";
import {
  parseTransactionForm,
  transactionFormSchema,
} from "../src/features/transactions/validation";

const category: TransactionCategory = {
  colorHex: "#D96C52",
  id: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
  isActive: true,
  name: "Makanan & minuman",
  slug: "food-drink",
  sortOrder: 10,
};

function createTransaction(
  overrides: Partial<TransactionRecord> = {},
): TransactionRecord {
  return {
    amountIdr: 48_000,
    category,
    categoryId: category.id,
    createdAt: "2026-07-30T02:00:00.000Z",
    id: crypto.randomUUID(),
    merchant: null,
    notes: "Makan siang",
    receiptItems: [],
    receiptObjectKey: null,
    source: "manual",
    transactionDate: "2026-07-30",
    updatedAt: "2026-07-30T02:00:00.000Z",
    ...overrides,
  };
}

describe("transaction input contract", () => {
  it("normalizes formatted rupiah and trimmed optional notes", () => {
    expect(
      transactionFormSchema.parse({
        amountIdr: "326.500",
        categoryId: category.id,
        notes: "  Belanja kebutuhan rumah  ",
        transactionDate: "2026-07-30",
      }),
    ).toEqual({
      amountIdr: 326_500,
      categoryId: category.id,
      notes: "Belanja kebutuhan rumah",
      transactionDate: "2026-07-30",
    });
  });

  it("stores an empty optional note as null", () => {
    expect(
      transactionFormSchema.parse({
        amountIdr: "1",
        categoryId: category.id,
        notes: "   ",
        transactionDate: "2026-07-30",
      }).notes,
    ).toBeNull();
  });

  it.each(["0", "-500", "1,50", "1000000000000"])(
    "rejects unsafe amount %s",
    (amountIdr) => {
      expect(
        transactionFormSchema.safeParse({
          amountIdr,
          categoryId: category.id,
          notes: "",
          transactionDate: "2026-07-30",
        }).success,
      ).toBe(false);
    },
  );

  it.each(["2026-02-30", "30-07-2026", ""])(
    "rejects invalid date %s",
    (transactionDate) => {
      expect(
        transactionFormSchema.safeParse({
          amountIdr: "50000",
          categoryId: category.id,
          notes: "",
          transactionDate,
        }).success,
      ).toBe(false);
    },
  );

  it("rejects a transaction date after today", () => {
    expect(
      transactionFormSchema.safeParse({
        amountIdr: "50000",
        categoryId: category.id,
        notes: "",
        transactionDate: "2999-01-01",
      }).success,
    ).toBe(false);
  });

  it("returns stable field errors and preserves submitted values", () => {
    const formData = new FormData();
    formData.set("amountIdr", "-500");
    formData.set("categoryId", "");
    formData.set("transactionDate", "2026-02-30");
    formData.set("notes", "Catatan tetap ada");

    const result = parseTransactionForm(formData);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.state.fieldErrors).toMatchObject({
        amountIdr: expect.any(String),
        categoryId: expect.any(String),
        transactionDate: expect.any(String),
      });
      expect(result.state.values.notes).toBe("Catatan tetap ada");
    }
  });
});

describe("transaction presentation contract", () => {
  it("formats whole IDR values with tabular-friendly separators", () => {
    expect(formatIdr(326_500)).toBe("Rp326.500");
    expect(formatExpenseIdr(326_500)).toBe("−Rp326.500");
  });

  it("uses Jakarta local date instead of UTC date", () => {
    expect(getJakartaDateInputValue(new Date("2026-07-30T18:15:00.000Z"))).toBe(
      "2026-07-31",
    );
  });

  it("uses merchant, then notes, then a category fallback as primary label", () => {
    expect(
      getTransactionPrimaryLabel(
        createTransaction({ merchant: "Kedai Sela", notes: "Kopi" }),
      ),
    ).toBe("Kedai Sela");
    expect(
      getTransactionPrimaryLabel(
        createTransaction({ merchant: null, notes: "Kopi" }),
      ),
    ).toBe("Kopi");
    expect(
      getTransactionPrimaryLabel(
        createTransaction({ merchant: null, notes: null }),
      ),
    ).toBe("Pengeluaran makanan & minuman");
  });

  it("groups today, current week, and older transactions without changing order", () => {
    const transactions = [
      createTransaction({ transactionDate: "2026-07-30" }),
      createTransaction({ transactionDate: "2026-07-28" }),
      createTransaction({ transactionDate: "2026-07-26" }),
    ];

    expect(
      groupTransactionsByDate(transactions, "2026-07-30").map((group) => [
        group.label,
        group.transactions[0].transactionDate,
      ]),
    ).toEqual([
      ["Hari ini", "2026-07-30"],
      ["Minggu ini", "2026-07-28"],
      ["Juli 2026", "2026-07-26"],
    ]);
  });
});

describe("transaction authorization structure", () => {
  it("derives ownership from verified claims and never references a service role", async () => {
    const [actions, data] = await Promise.all([
      readFile(
        join(process.cwd(), "src", "features", "transactions", "actions.ts"),
        "utf8",
      ),
      readFile(
        join(process.cwd(), "src", "features", "transactions", "data.ts"),
        "utf8",
      ),
    ]);

    expect(actions).toContain("getAuthenticatedUserId()");
    expect(data).toContain("user_id: userId");
    expect(data.match(/\.eq\("user_id", userId\)/g)).toHaveLength(8);
    expect(`${actions}\n${data}`).not.toMatch(/service[_-]?role/i);
  });

  it("forces manual source server-side and does not accept receipt fields", async () => {
    const data = await readFile(
      join(process.cwd(), "src", "features", "transactions", "data.ts"),
      "utf8",
    );

    expect(data).toContain('source: "manual"');
    expect(data).not.toContain("receipt_object_key: input");
    expect(data).not.toContain("receipt_items: input");
  });
});
