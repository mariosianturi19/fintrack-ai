import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  parseCategories,
  parseTransactions,
} from "@/features/transactions/data";
import { getLatestWeeklyInsightState } from "@/features/insights/data";
import { getLatestMonthlyInsightState } from "@/features/insights/monthly-data";
import { getBudgetOverview } from "@/features/budgets/data";
import { parseWallets } from "@/features/wallets/data";

import { createDashboardPeriod, createDashboardSnapshot } from "./aggregate";

const dashboardMaxRows = 2_000;
const recentTransactionLimit = 5;
const transactionSelect =
  "id, category_id, wallet_id, amount_idr, transaction_date, merchant, notes, source, created_at, updated_at";

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

export async function getDashboardSnapshot(
  userId: string,
  date = new Date(),
  walletId: string | null = null,
) {
  const period = createDashboardPeriod(date);
  const supabase = await createClient();
  let periodQuery = supabase
    .from("transactions")
    .select(transactionSelect, { count: "exact" })
    .eq("user_id", userId)
    .gte("transaction_date", period.queryStartDate)
    .lt("transaction_date", period.endDateExclusive)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, dashboardMaxRows - 1);
  let recentQuery = supabase
    .from("transactions")
    .select(transactionSelect)
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(recentTransactionLimit);

  if (walletId) {
    periodQuery = periodQuery.eq("wallet_id", walletId);
    recentQuery = recentQuery.eq("wallet_id", walletId);
  }

  const [
    periodResult,
    recentResult,
    categoryResult,
    walletResult,
    allTransactionResult,
    weeklyInsightState,
    monthlyInsightState,
    budgetOverview,
  ] = await Promise.all([
    periodQuery,
    recentQuery,
    supabase
      .from("categories")
      .select("id, slug, name, color_hex, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("wallets")
      .select("id, name, wallet_type, created_at, updated_at")
      .eq("user_id", userId),
    supabase
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    getLatestWeeklyInsightState(userId),
    getLatestMonthlyInsightState(userId),
    getBudgetOverview(userId, date),
  ]);

  if (
    periodResult.error ||
    recentResult.error ||
    categoryResult.error ||
    walletResult.error ||
    allTransactionResult.error
  ) {
    const error =
      periodResult.error ??
      recentResult.error ??
      categoryResult.error ??
      walletResult.error ??
      allTransactionResult.error;
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
    const wallets = parseWallets(walletResult.data);
    const transactions = parseTransactions(
      periodResult.data,
      categories,
      wallets,
    );
    const recentTransactions = parseTransactions(
      recentResult.data,
      categories,
      wallets,
    );

    return createDashboardSnapshot(
      transactions,
      recentTransactions,
      period,
      weeklyInsightState,
      monthlyInsightState,
      budgetOverview,
      (allTransactionResult.count ?? 0) > 0,
    );
  } catch (error) {
    reportDashboardError("Respons dashboard tidak valid.", error);
    throw new DashboardDataError("database", { cause: error });
  }
}
