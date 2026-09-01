import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/privileged";

import {
  DETERMINISTIC_INSIGHT_MODEL,
  type WeeklyInsight,
  type WeeklyInsightFacts,
  type WeeklyInsightState,
} from "./domain";
import { getWeekEndDate } from "./period";

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const safeNonnegativeInteger = z.coerce
  .number()
  .int()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER);
const safePositiveInteger = safeNonnegativeInteger.refine((value) => value > 0);

const weeklyCandidateRowSchema = z.object({
  category_totals: z.array(
    z.object({
      amountIdr: safePositiveInteger,
      name: z.string().min(1).max(64),
    }),
  ),
  previous_total_amount_idr: safeNonnegativeInteger,
  top_category_amount_idr: safePositiveInteger,
  top_category_name: z.string().min(1).max(64),
  total_amount_idr: safePositiveInteger,
  transaction_count: z.coerce.number().int().positive(),
  user_id: z.string().uuid(),
  week_end: dateOnlySchema,
  week_start: dateOnlySchema,
});

const weeklyInsightRowSchema = z.object({
  generated_at: z.string(),
  model_name: z.string().min(1).max(100),
  previous_total_amount_idr: safeNonnegativeInteger,
  summary: z.string().min(1).max(2_000),
  top_category_amount_idr: safePositiveInteger.nullable(),
  top_category_name: z.string().min(1).max(64).nullable(),
  total_amount_idr: safeNonnegativeInteger,
  transaction_count: z.coerce.number().int().min(0),
  week_start: dateOnlySchema,
});

type WeeklyInsightDataErrorCode =
  "candidate_limit" | "database" | "invalid_data";

export class WeeklyInsightDataError extends Error {
  constructor(public readonly code: WeeklyInsightDataErrorCode) {
    super(code);
    this.name = "WeeklyInsightDataError";
  }
}

function reportInsightDataError(context: string, error: unknown) {
  console.error(`[Fintrack AI] ${context}`, {
    code:
      error && typeof error === "object" && "code" in error
        ? String(error.code).slice(0, 40)
        : undefined,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
}

function mapCandidate(
  row: z.infer<typeof weeklyCandidateRowSchema>,
): WeeklyInsightFacts {
  return {
    categoryTotals: row.category_totals,
    previousTotalAmountIdr: row.previous_total_amount_idr,
    topCategoryAmountIdr: row.top_category_amount_idr,
    topCategoryName: row.top_category_name,
    totalAmountIdr: row.total_amount_idr,
    transactionCount: row.transaction_count,
    userId: row.user_id,
    weekEnd: row.week_end,
    weekStart: row.week_start,
  };
}

function mapInsight(
  row: z.infer<typeof weeklyInsightRowSchema>,
): WeeklyInsight {
  return {
    generatedAt: row.generated_at,
    modelName: row.model_name,
    previousTotalAmountIdr: row.previous_total_amount_idr,
    summary: row.summary,
    topCategoryAmountIdr: row.top_category_amount_idr,
    topCategoryName: row.top_category_name,
    totalAmountIdr: row.total_amount_idr,
    transactionCount: row.transaction_count,
    weekEnd: getWeekEndDate(row.week_start),
    weekStart: row.week_start,
  };
}

export async function listWeeklyInsightCandidates(weekStart: string) {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase.rpc("get_weekly_insight_candidates", {
    p_week_start: weekStart,
  });

  if (error) {
    reportInsightDataError("Agregasi insight mingguan gagal.", error);
    throw new WeeklyInsightDataError("database");
  }

  try {
    return z.array(weeklyCandidateRowSchema).parse(data).map(mapCandidate);
  } catch (parseError) {
    reportInsightDataError(
      "Agregasi insight mingguan tidak valid.",
      parseError,
    );
    throw new WeeklyInsightDataError("invalid_data");
  }
}

export async function claimWeeklyInsight(
  facts: WeeklyInsightFacts,
  fallbackSummary: string,
) {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase
    .from("weekly_insights")
    .insert({
      model_name: DETERMINISTIC_INSIGHT_MODEL,
      previous_total_amount_idr: facts.previousTotalAmountIdr,
      summary: fallbackSummary,
      top_category_amount_idr: facts.topCategoryAmountIdr,
      top_category_name: facts.topCategoryName,
      total_amount_idr: facts.totalAmountIdr,
      transaction_count: facts.transactionCount,
      user_id: facts.userId,
      week_start: facts.weekStart,
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

  if (error || !data) {
    reportInsightDataError("Klaim insight mingguan gagal.", error);
    throw new WeeklyInsightDataError("database");
  }

  return z.string().uuid().parse(data.id);
}

export async function updateWeeklyInsightNarrative(
  insightId: string,
  summary: string,
  modelName: string,
) {
  const supabase = createPrivilegedClient();
  const { data, error } = await supabase
    .from("weekly_insights")
    .update({
      generated_at: new Date().toISOString(),
      model_name: modelName,
      summary,
    })
    .eq("id", insightId)
    .select("id")
    .maybeSingle();

  if (error?.code === "P0010" || (!error && !data)) return false;

  if (error || !data) {
    reportInsightDataError("Penyimpanan narasi insight gagal.", error);
    throw new WeeklyInsightDataError("database");
  }
  return true;
}

export async function getLatestWeeklyInsightState(
  userId: string,
): Promise<WeeklyInsightState> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_insights")
    .select(
      "week_start, summary, model_name, generated_at, transaction_count, total_amount_idr, previous_total_amount_idr, top_category_name, top_category_amount_idr",
    )
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    reportInsightDataError("Insight terbaru belum dapat dimuat.", error);
    return { insight: null, status: "unavailable" };
  }

  if (!data) {
    return { insight: null, status: "empty" };
  }

  try {
    return {
      insight: mapInsight(weeklyInsightRowSchema.parse(data)),
      status: "ready",
    };
  } catch (parseError) {
    reportInsightDataError("Insight terbaru tidak valid.", parseError);
    return { insight: null, status: "unavailable" };
  }
}
