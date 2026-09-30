import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { createBudgetMonth } from "../src/features/budgets/period";
import type { MonthlyInsightFacts } from "../src/features/insights/monthly-domain";
import { createPreviousCompletedMonth } from "../src/features/insights/monthly-period";
import {
  createDeterministicMonthlySummary,
  getMonthlyComparison,
} from "../src/features/insights/monthly-summary";
import { createQuestionPeriodOptions } from "../src/features/questions/period";
import {
  FINANCE_QUESTION_FALLBACK_MODEL,
  shouldUseFinanceQuestionFallback,
} from "../src/features/questions/provider-fallback";
import {
  FinanceQuestionResponseError,
  parseFinanceQuestionResponse,
} from "../src/features/questions/response";
import { financeQuestionRequestSchema } from "../src/features/questions/validation";
import {
  createTransactionListQuery,
  escapeLikePattern,
  parseTransactionFilters,
} from "../src/features/transactions/filters";

describe("Phase 2 transaction discovery contract", () => {
  it("normalizes supported URL filters and rejects invalid values", () => {
    expect(
      parseTransactionFilters({
        category: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
        from: "2026-09-01",
        q: "  Indomaret  ",
        to: "2026-09-26",
      }),
    ).toEqual({
      categoryId: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
      endDate: "2026-09-26",
      search: "Indomaret",
      startDate: "2026-09-01",
    });

    expect(
      parseTransactionFilters({
        category: "not-a-uuid",
        from: "2026-09-30",
        to: "2026-09-01",
      }),
    ).toMatchObject({ categoryId: null, endDate: null });
  });

  it("preserves active filters in pagination links", () => {
    const query = createTransactionListQuery(
      {
        categoryId: null,
        endDate: "2026-09-26",
        search: "Kopi susu",
        startDate: "2026-09-01",
      },
      3,
    );
    expect(new URLSearchParams(query).get("page")).toBe("3");
    expect(new URLSearchParams(query).get("q")).toBe("Kopi susu");
  });

  it("escapes wildcard characters before an ilike filter", () => {
    expect(escapeLikePattern("50%_off\\promo")).toBe("50\\%\\_off\\\\promo");
  });
});

describe("Phase 2 budget and monthly period contract", () => {
  it("uses Jakarta month boundaries", () => {
    expect(
      createBudgetMonth(new Date("2026-09-30T17:30:00.000Z")),
    ).toMatchObject({
      monthEnd: "2026-10-31",
      monthStart: "2026-10-01",
    });
    expect(
      createPreviousCompletedMonth(new Date("2026-09-30T17:30:00.000Z")),
    ).toEqual({
      endDate: "2026-09-30",
      endDateExclusive: "2026-10-01",
      startDate: "2026-09-01",
    });
  });

  it("creates a grounded monthly fallback", () => {
    const facts: MonthlyInsightFacts = {
      categoryTotals: [{ amountIdr: 200_000, name: "Makanan & minuman" }],
      monthEnd: "2026-08-31",
      monthStart: "2026-08-01",
      peakSpendingAmountIdr: 100_000,
      peakSpendingDate: "2026-08-20",
      previousTotalAmountIdr: 150_000,
      topCategoryAmountIdr: 200_000,
      topCategoryName: "Makanan & minuman",
      totalAmountIdr: 200_000,
      transactionCount: 4,
      userId: "8ed7db81-5e57-43bb-ab1e-b9afe2273270",
    };
    expect(getMonthlyComparison(200_000, 150_000)).toBe("higher");
    expect(createDeterministicMonthlySummary(facts)).toContain(
      "Makanan & minuman",
    );
    expect(createDeterministicMonthlySummary(facts)).not.toMatch(/200|150/u);
  });

  it("requires an explicit confirmation surface before deleting a budget", async () => {
    const dialog = await readFile(
      join(
        process.cwd(),
        "src",
        "features",
        "budgets",
        "components",
        "delete-budget-dialog.tsx",
      ),
      "utf8",
    );

    expect(dialog).toContain("showModal()");
    expect(dialog).toContain("Transaksi dan pengeluaran yang sudah tercatat");
    expect(dialog).toContain("autoFocus");
    expect(dialog).toContain("deleteCategoryBudgetAction");
  });
});

describe("Phase 2 finance question boundary", () => {
  it("offers bounded periods and rejects an overlong custom request", () => {
    const periods = createQuestionPeriodOptions(
      new Date("2026-09-26T05:00:00.000Z"),
    );
    expect(periods.map((period) => period.key)).toEqual([
      "month",
      "quarter",
      "year",
    ]);
    expect(
      financeQuestionRequestSchema.safeParse({
        endDate: "2026-09-26",
        question: "Kategori apa yang terbesar?",
        requestId: crypto.randomUUID(),
        startDate: "2025-09-01",
      }).success,
    ).toBe(false);
  });

  it("rejects calendar dates that only match the expected text shape", () => {
    expect(
      financeQuestionRequestSchema.safeParse({
        endDate: "2026-99-99",
        question: "Kategori apa yang terbesar?",
        requestId: crypto.randomUUID(),
        startDate: "2026-09-01",
      }).success,
    ).toBe(false);
  });

  it("parses validated JSON and a provider code-fence variant", () => {
    expect(
      parseFinanceQuestionResponse('{"answer":"Totalnya Rp72.250."}'),
    ).toBe("Totalnya Rp72.250.");
    expect(
      parseFinanceQuestionResponse(
        '```json\n{"answer":"Merchant terbesar Rp27.250."}\n```',
      ),
    ).toBe("Merchant terbesar Rp27.250.");
    expect(() => parseFinanceQuestionResponse("jawaban tanpa JSON")).toThrow(
      FinanceQuestionResponseError,
    );
  });

  it("falls back for transient availability or malformed output", () => {
    expect(FINANCE_QUESTION_FALLBACK_MODEL).toBe("gemini-3.5-flash-lite");
    expect(shouldUseFinanceQuestionFallback({ status: 503 })).toBe(true);
    expect(shouldUseFinanceQuestionFallback({ status: 504 })).toBe(true);
    expect(
      shouldUseFinanceQuestionFallback(new FinanceQuestionResponseError()),
    ).toBe(true);
    expect(shouldUseFinanceQuestionFallback({ status: 429 })).toBe(false);
    expect(shouldUseFinanceQuestionFallback(new Error("malformed"))).toBe(
      false,
    );
  });

  it("keeps receipt detail out of the aggregate question context", async () => {
    const [migration, gemini] = await Promise.all([
      readFile(
        join(
          process.cwd(),
          "supabase",
          "migrations",
          "20260926090000_phase2.sql",
        ),
        "utf8",
      ),
      readFile(
        join(process.cwd(), "src", "features", "questions", "gemini.ts"),
        "utf8",
      ),
    ]);
    const questionContext = migration.slice(
      migration.indexOf(
        "create or replace function public.get_finance_question_context",
      ),
    );
    expect(questionContext).not.toContain("receipt_items");
    expect(questionContext).not.toContain("receipt_object_key");
    expect(questionContext).not.toContain("transaction_row.notes");
    expect(gemini).toContain("input tidak tepercaya");
  });
});

describe("Phase 2 SQL verification contract", () => {
  it("keeps PL/pgSQL variables distinct from catalog column names", async () => {
    const verification = await readFile(
      join(process.cwd(), "supabase", "tests", "f2_schema_verification.sql"),
      "utf8",
    );

    expect(verification).toContain("v_table_name text");
    expect(verification).toContain("column_row.table_name = 'transactions'");
    expect(verification).not.toMatch(/\n\s*table_name text;/u);
  });
});
