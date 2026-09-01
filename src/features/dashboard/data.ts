import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  parseCategories,
  parseTransactions,
} from "@/features/transactions/data";
import { getLatestWeeklyInsightState } from "@/features/insights/data";

import { createDashboardPeriod, createDashboardSnapshot } from "./aggregate";

const dashboardMaxRows = 2_000;
const recentTransactionLimit = 5;
const transactionSelect =
  "id, category_id, amount_idr, transaction_date, merchant, notes, source, created_at, updated_at";

type DashboardDataErrorCode = "database" | "data_limit";

export class DashboardDataError extends Error {
  readonly code: DashboardDataErrorCode;

  constructor(code: DashboardDataErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "DashboardDataError";
    this.code = code;
  }
}

function reportDashboardError(context: string, error: unknown) {
  console.error(`[Fintrack AI] ${context}`, error);
}

export async function getDashboardSnapshot(userId: string, date = new Date()) {
  const period = createDashboardPeriod(date);
  const supabase = await createClient();
  const [periodResult, recentResult, categoryResult, weeklyInsightState] =
    await Promise.all([
      supabase
        .from("transactions")
        .select(transactionSelect, { count: "exact" })
        .eq("user_id", userId)
        .gte("transaction_date", period.queryStartDate)
        .lt("transaction_date", period.endDateExclusive)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(0, dashboardMaxRows - 1),
      supabase
        .from("transactions")
        .select(transactionSelect)
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(recentTransactionLimit),
      supabase
        .from("categories")
        .select("id, slug, name, color_hex, sort_order, is_active")
        .order("sort_order", { ascending: true }),
      getLatestWeeklyInsightState(userId),
    ]);

  if (periodResult.error || recentResult.error || categoryResult.error) {
    const error =
      periodResult.error ?? recentResult.error ?? categoryResult.error;
    reportDashboardError("Gagal memuat ringkasan dashboard.", error);
    throw new DashboardDataError("database", { cause: error });
  }

  if (periodResult.count === null) {
    reportDashboardError(
      "Jumlah transaksi dashboard tidak tersedia.",
      new Error("Missing exact count"),
    );
    throw new DashboardDataError("database");
  }

  if (periodResult.count > dashboardMaxRows) {
    throw new DashboardDataError("data_limit");
  }

  try {
    const categories = parseCategories(categoryResult.data);
    const transactions = parseTransactions(periodResult.data, categories);
    const recentTransactions = parseTransactions(recentResult.data, categories);

    return createDashboardSnapshot(
      transactions,
      recentTransactions,
      period,
      weeklyInsightState,
    );
  } catch (error) {
    reportDashboardError("Respons dashboard tidak valid.", error);
    throw new DashboardDataError("database", { cause: error });
  }
}
