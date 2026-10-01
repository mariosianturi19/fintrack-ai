import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import type { FinanceQuestionContext } from "./domain";

const safeAmount = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const count = z.coerce.number().int().min(0);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const contextSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().min(1).max(64),
      total_amount_idr: safeAmount,
      transaction_count: count,
    }),
  ),
  days: z.array(
    z.object({
      total_amount_idr: safeAmount,
      transaction_count: count,
      transaction_date: date,
    }),
  ),
  merchants: z.array(
    z.object({
      merchant: z.string().min(1).max(120),
      total_amount_idr: safeAmount,
      transaction_count: count,
    }),
  ),
  overall: z.object({
    total_amount_idr: safeAmount,
    transaction_count: count,
  }),
  period: z.object({ endDate: date, startDate: date }),
});

export async function getFinanceQuestionContext(
  startDate: string,
  endDate: string,
  walletId: string | null,
): Promise<FinanceQuestionContext> {
  const { data, error } = await (
    await createClient()
  ).rpc("get_finance_question_context", {
    p_end_date: endDate,
    p_start_date: startDate,
    p_wallet_id: walletId,
  });
  if (error) throw new Error("question_context_unavailable");
  const parsed = contextSchema.parse(data);

  return {
    categories: parsed.categories.map((row) => ({
      name: row.name,
      totalAmountIdr: row.total_amount_idr,
      transactionCount: row.transaction_count,
    })),
    days: parsed.days.map((row) => ({
      date: row.transaction_date,
      totalAmountIdr: row.total_amount_idr,
      transactionCount: row.transaction_count,
    })),
    merchants: parsed.merchants.map((row) => ({
      merchant: row.merchant,
      totalAmountIdr: row.total_amount_idr,
      transactionCount: row.transaction_count,
    })),
    overall: {
      totalAmountIdr: parsed.overall.total_amount_idr,
      transactionCount: parsed.overall.transaction_count,
    },
    period: parsed.period,
  };
}
