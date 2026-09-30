import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const resultSchema = z
  .array(
    z.object({
      accepted: z.boolean(),
      reason: z.enum(["accepted", "day", "duplicate", "global_day", "minute"]),
      retry_at: z.string().nullable(),
    }),
  )
  .length(1);

export async function consumeFinanceQuestionQuota(requestId: string) {
  const { data, error } = await (
    await createClient()
  ).rpc("consume_finance_question_quota", { p_request_id: requestId });
  if (error) throw new Error("question_quota_unavailable");
  const [result] = resultSchema.parse(data);
  return {
    accepted: result.accepted,
    reason: result.reason,
    retryAt: result.retry_at,
  } as const;
}
