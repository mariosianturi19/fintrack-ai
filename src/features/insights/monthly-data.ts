import "server-only";

import { z } from "zod";

import { createPrivilegedClient } from "@/lib/supabase/privileged";
import { createClient } from "@/lib/supabase/server";

import {
  DETERMINISTIC_MONTHLY_INSIGHT_MODEL,
  type MonthlyInsight,
  type MonthlyInsightFacts,
  type MonthlyInsightState,
} from "./monthly-domain";
import { getMonthEndDate } from "./monthly-period";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const safeAmount = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const positiveAmount = safeAmount.refine((value) => value > 0);
const categoryTotalsSchema = z.array(
  z.object({ amountIdr: positiveAmount, name: z.string().min(1).max(64) }),
);

const candidateSchema = z.object({
  category_totals: categoryTotalsSchema,
  month_end: dateSchema,
  month_start: dateSchema,
  peak_spending_amount_idr: positiveAmount,
  peak_spending_date: dateSchema,
  previous_total_amount_idr: safeAmount,
  top_category_amount_idr: positiveAmount,
  top_category_name: z.string().min(1).max(64),
  total_amount_idr: positiveAmount,
  transaction_count: z.coerce.number().int().positive(),
  user_id: z.string().uuid(),
});

const insightSchema = z.object({
  category_totals: categoryTotalsSchema,
  generated_at: z.string(),
  model_name: z.string().min(1).max(100),
  month_start: dateSchema,
  peak_spending_amount_idr: positiveAmount.nullable(),
  peak_spending_date: dateSchema.nullable(),
  previous_total_amount_idr: safeAmount,
  summary: z.string().min(1).max(2400),
  top_category_amount_idr: positiveAmount.nullable(),
  top_category_name: z.string().min(1).max(64).nullable(),
  total_amount_idr: safeAmount,
  transaction_count: z.coerce.number().int().min(0),
});

export class MonthlyInsightDataError extends Error {
  constructor(
    public readonly code: "candidate_limit" | "database" | "invalid_data",
  ) {
    super(code);
    this.name = "MonthlyInsightDataError";
  }
}

function mapCandidate(
  row: z.infer<typeof candidateSchema>,
): MonthlyInsightFacts {
  return {
    categoryTotals: row.category_totals,
    monthEnd: row.month_end,
    monthStart: row.month_start,
    peakSpendingAmountIdr: row.peak_spending_amount_idr,
    peakSpendingDate: row.peak_spending_date,
    previousTotalAmountIdr: row.previous_total_amount_idr,
    topCategoryAmountIdr: row.top_category_amount_idr,
    topCategoryName: row.top_category_name,
    totalAmountIdr: row.total_amount_idr,
    transactionCount: row.transaction_count,
    userId: row.user_id,
  };
}

function mapInsight(row: z.infer<typeof insightSchema>): MonthlyInsight {
  return {
    categoryTotals: row.category_totals,
    generatedAt: row.generated_at,
    modelName: row.model_name,
    monthEnd: getMonthEndDate(row.month_start),
    monthStart: row.month_start,
    peakSpendingAmountIdr: row.peak_spending_amount_idr,
    peakSpendingDate: row.peak_spending_date,
    previousTotalAmountIdr: row.previous_total_amount_idr,
    summary: row.summary,
    topCategoryAmountIdr: row.top_category_amount_idr,
    topCategoryName: row.top_category_name,
    totalAmountIdr: row.total_amount_idr,
    transactionCount: row.transaction_count,
  };
}

export async function listMonthlyInsightCandidates(monthStart: string) {
  const { data, error } = await createPrivilegedClient().rpc(
    "get_monthly_insight_candidates",
    { p_month_start: monthStart },
  );
  if (error) throw new MonthlyInsightDataError("database");
  try {
    return z.array(candidateSchema).parse(data).map(mapCandidate);
  } catch {
    throw new MonthlyInsightDataError("invalid_data");
  }
}

export async function claimMonthlyInsight(
  facts: MonthlyInsightFacts,
  fallbackSummary: string,
) {
  const { data, error } = await createPrivilegedClient()
    .from("monthly_insights")
    .insert({
      category_totals: facts.categoryTotals,
      model_name: DETERMINISTIC_MONTHLY_INSIGHT_MODEL,
      month_start: facts.monthStart,
      peak_spending_amount_idr: facts.peakSpendingAmountIdr,
      peak_spending_date: facts.peakSpendingDate,
      previous_total_amount_idr: facts.previousTotalAmountIdr,
      summary: fallbackSummary,
      top_category_amount_idr: facts.topCategoryAmountIdr,
      top_category_name: facts.topCategoryName,
      total_amount_idr: facts.totalAmountIdr,
      transaction_count: facts.transactionCount,
      user_id: facts.userId,
    })
    .select("id")
    .maybeSingle();

  if (
    error?.code === "23505" ||
    error?.code === "P0010" ||
    error?.code === "23503"
  ) {
    return null;
  }
  if (error || !data) throw new MonthlyInsightDataError("database");
  return z.string().uuid().parse(data.id);
}

export async function updateMonthlyInsightNarrative(
  insightId: string,
  summary: string,
  modelName: string,
) {
  const { data, error } = await createPrivilegedClient()
    .from("monthly_insights")
    .update({
      generated_at: new Date().toISOString(),
      model_name: modelName,
      summary,
    })
    .eq("id", insightId)
    .select("id")
    .maybeSingle();
  if (error?.code === "P0010" || (!error && !data)) return false;
  if (error || !data) throw new MonthlyInsightDataError("database");
  return true;
}

export async function getLatestMonthlyInsightState(
  userId: string,
): Promise<MonthlyInsightState> {
  const { data, error } = await (
    await createClient()
  )
    .from("monthly_insights")
    .select(
      "month_start, summary, model_name, generated_at, transaction_count, total_amount_idr, previous_total_amount_idr, top_category_name, top_category_amount_idr, peak_spending_date, peak_spending_amount_idr, category_totals",
    )
    .eq("user_id", userId)
    .order("month_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { insight: null, status: "unavailable" };
  if (!data) return { insight: null, status: "empty" };
  try {
    return { insight: mapInsight(insightSchema.parse(data)), status: "ready" };
  } catch {
    return { insight: null, status: "unavailable" };
  }
}
