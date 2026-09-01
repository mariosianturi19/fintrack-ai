import { isAuthorizedCronRequest } from "@/features/insights/cron-auth";
import { generatePreviousWeekInsights } from "@/features/insights/generate";
import { environment } from "@/lib/env/server";
import {
  processScheduledDeletions,
  reconcileDeletedAccountReceipts,
} from "@/features/account-deletion/scheduled";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "no-store, max-age=0",
} as const;

export async function GET(request: Request) {
  if (!environment.CRON_SECRET || !environment.SUPABASE_SECRET_KEY) {
    return Response.json(
      { error: "scheduled_operation_unavailable" },
      { headers: responseHeaders, status: 503 },
    );
  }

  if (!isAuthorizedCronRequest(request, environment.CRON_SECRET)) {
    return Response.json(
      { error: "unauthorized" },
      { headers: responseHeaders, status: 401 },
    );
  }

  try {
    const deletions = await processScheduledDeletions();
    let receiptCleanup = { removedCount: 0, failedCount: 0 };
    try {
      receiptCleanup = {
        ...(await reconcileDeletedAccountReceipts()),
        failedCount: 0,
      };
    } catch {
      // Storage trouble must not suppress the existing weekly insight job.
      receiptCleanup.failedCount = 1;
    }
    const result = await generatePreviousWeekInsights();

    return Response.json(
      {
        ok: deletions.failedCount === 0 && receiptCleanup.failedCount === 0,
        ...result,
        deletions,
        receiptCleanup,
      },
      {
        headers: responseHeaders,
        status: deletions.failedCount || receiptCleanup.failedCount ? 500 : 200,
      },
    );
  } catch (error) {
    console.error("[Fintrack AI] Operasi terjadwal gagal.", {
      code:
        error && typeof error === "object" && "code" in error
          ? String(error.code).slice(0, 40)
          : undefined,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });

    return Response.json(
      { error: "scheduled_operation_failed" },
      { headers: responseHeaders, status: 500 },
    );
  }
}
