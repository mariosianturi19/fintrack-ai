import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const quotaResultSchema = z
  .array(
    z.object({
      accepted: z.boolean(),
      reason: z.enum(["accepted", "duplicate", "minute", "day"]),
      retry_at: z.string().nullable(),
    }),
  )
  .length(1);

export type ReceiptQuotaResult = Readonly<{
  accepted: boolean;
  reason: "accepted" | "duplicate" | "minute" | "day";
  retryAt: string | null;
}>;

export async function consumeReceiptAiQuota(
  requestId: string,
): Promise<ReceiptQuotaResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_receipt_ai_quota", {
    p_request_id: requestId,
  });

  if (error) {
    console.error("[Fintrack AI] Pemeriksaan kuota AI gagal.", {
      code: error.code,
    });
    throw new Error("receipt_quota_unavailable");
  }

  const [result] = quotaResultSchema.parse(data);

  return {
    accepted: result.accepted,
    reason: result.reason,
    retryAt: result.retry_at,
  };
}
