export const DETERMINISTIC_INSIGHT_MODEL = "deterministic-v1";

export type WeeklyComparison =
  "higher" | "lower" | "no_previous_data" | "similar";

export type WeeklyInsightCategoryTotal = Readonly<{
  amountIdr: number;
  name: string;
}>;

export type WeeklyInsightFacts = Readonly<{
  categoryTotals: readonly WeeklyInsightCategoryTotal[];
  previousTotalAmountIdr: number;
  topCategoryAmountIdr: number;
  topCategoryName: string;
  totalAmountIdr: number;
  transactionCount: number;
  userId: string;
  weekEnd: string;
  weekStart: string;
}>;

export type WeeklyInsight = Readonly<{
  generatedAt: string;
  modelName: string;
  previousTotalAmountIdr: number;
  summary: string;
  topCategoryAmountIdr: number | null;
  topCategoryName: string | null;
  totalAmountIdr: number;
  transactionCount: number;
  weekEnd: string;
  weekStart: string;
}>;

export type WeeklyInsightState = Readonly<{
  insight: WeeklyInsight | null;
  status: "empty" | "ready" | "unavailable";
}>;
