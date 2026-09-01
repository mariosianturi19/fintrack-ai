import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import type {
  TransactionCategory,
  TransactionRecord,
} from "../src/features/transactions/domain";
import {
  buildTransactionExportRows,
  createTransactionExportFilename,
  createTransactionsCsv,
  createTransactionsXlsx,
  neutralizeSpreadsheetFormula,
} from "../src/features/transactions/export";

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
    amountIdr: 12_345,
    category,
    categoryId: category.id,
    createdAt: "2026-08-01T02:00:00.000Z",
    id: "a70d6b83-c68f-4af6-954d-8f26d155a3f0",
    merchant: "Kedai Sela",
    notes: "Makan siang",
    receiptItems: [],
    receiptObjectKey: null,
    source: "manual",
    transactionDate: "2026-08-01",
    updatedAt: "2026-08-01T02:05:00.000Z",
    ...overrides,
  };
}

describe("transaction export safety", () => {
  it.each(["=1+1", "+SUM(A1:A2)", "-2+3", "@cmd", "  =1+1"])(
    "neutralizes spreadsheet formula input %s",
    (value) => {
      expect(neutralizeSpreadsheetFormula(value)).toBe(`'${value}`);
    },
  );

  it("preserves ordinary user text and removes null bytes", () => {
    expect(neutralizeSpreadsheetFormula("Kedai Sela")).toBe("Kedai Sela");
    expect(neutralizeSpreadsheetFormula("Kedai\u0000 Sela")).toBe("Kedai Sela");
  });

  it("applies neutralization before creating export rows", () => {
    const [row] = buildTransactionExportRows([
      createTransaction({ merchant: '=HYPERLINK("bad")' }),
    ]);

    expect(row.merchant).toBe('\'=HYPERLINK("bad")');
    expect(row.amountIdr).toBe(12_345);
  });
});

describe("transaction export formats", () => {
  it("creates UTF-8 CSV with quoted cells and formula-safe content", () => {
    const csv = createTransactionsCsv([
      createTransaction({ notes: "=1+1, baris baru\naman" }),
    ]);

    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Nominal (IDR)"');
    expect(csv).toContain('"12345"');
    expect(csv).toContain('"\'=1+1, baris baru\naman"');
  });

  it("creates a valid XLSX zip container", async () => {
    const buffer = await createTransactionsXlsx([createTransaction()]);

    expect(buffer.subarray(0, 2).toString("utf8")).toBe("PK");
    expect(buffer.byteLength).toBeGreaterThan(1_000);
  });

  it("uses deterministic dated filenames", () => {
    expect(
      createTransactionExportFilename(
        "xlsx",
        new Date("2026-08-01T03:00:00.000Z"),
      ),
    ).toBe("fintrack-ai-transactions-2026-08-01.xlsx");
  });
});

describe("transaction export authorization structure", () => {
  it("verifies the session in the route and keeps export queries owner scoped", async () => {
    const [route, data] = await Promise.all([
      readFile(
        join(
          process.cwd(),
          "src",
          "app",
          "api",
          "exports",
          "transactions",
          "route.ts",
        ),
        "utf8",
      ),
      readFile(
        join(process.cwd(), "src", "features", "transactions", "data.ts"),
        "utf8",
      ),
    ]);

    expect(route).toContain("getAuthenticatedUserId()");
    expect(route).toContain("listOwnedTransactionsForExport(userId)");
    expect(data).toContain("exportMaxRows = 50_000");
    expect(data).toContain('{ count: "exact" }');
    expect(`${route}\n${data}`).not.toMatch(/service[_-]?role/i);
  });
});
