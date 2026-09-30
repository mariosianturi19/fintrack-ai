export const DETERMINISTIC_MONTHLY_INSIGHT_MODEL = "deterministic-monthly-v1";

export type MonthlyComparison =
  "higher" | "lower" | "no_previous_data" | "similar";

export type MonthlyCategoryTotal = Readonly<{
  amountIdr: number;
  name: string;
}>;

export type MonthlyInsightFacts = Readonly<{
  categoryTotals: readonly MonthlyCategoryTotal[];
  monthEnd: string;
  monthStart: string;
  peakSpendingAmountIdr: number;
  peakSpendingDate: string;
  previousTotalAmountIdr: number;
  topCategoryAmountIdr: number;
  topCategoryName: string;
  totalAmountIdr: number;
  transactionCount: number;
  userId: string;
}>;

export type MonthlyInsight = Readonly<{
  categoryTotals: readonly MonthlyCategoryTotal[];
  generatedAt: string;
  modelName: string;
  monthEnd: string;
  monthStart: string;
  peakSpendingAmountIdr: number | null;
  peakSpendingDate: string | null;
  previousTotalAmountIdr: number;
  summary: string;
  topCategoryAmountIdr: number | null;
  topCategoryName: string | null;
  totalAmountIdr: number;
  transactionCount: number;
}>;

export type MonthlyInsightState = Readonly<{
  insight: MonthlyInsight | null;
  status: "empty" | "ready" | "unavailable";
}>;
