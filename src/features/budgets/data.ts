import "server-only";

import { z } from "zod";

import { parseCategories } from "@/features/transactions/data";
import { createClient } from "@/lib/supabase/server";

import type { BudgetOverview, BudgetStatus } from "./domain";
import { createBudgetMonth } from "./period";
import type { ParsedBudgetInput } from "./validation";

const safeAmount = z.coerce.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const budgetRowSchema = z.object({
  category_id: z.string().uuid(),
  id: z.string().uuid(),
  limit_amount_idr: safeAmount.refine((value) => value > 0),
});
const spendingRowSchema = z.object({
  category_id: z.string().uuid(),
  spent_amount_idr: safeAmount,
  transaction_count: z.coerce.number().int().min(0),
});

export class BudgetDataError extends Error {
  constructor(public readonly code: "category_unavailable" | "database") {
    super(code);
    this.name = "BudgetDataError";
  }
}

function getStatus(limit: number | null, spent: number): BudgetStatus {
  if (limit === null) return "not_set";
  if (spent >= limit) return "exceeded";
  if (spent / limit >= 0.8) return "near_limit";
  return "on_track";
}

export async function getBudgetOverview(
  userId: string,
  date = new Date(),
): Promise<BudgetOverview> {
  const period = createBudgetMonth(date);
  const supabase = await createClient();
  const [categoriesResult, budgetsResult, spendingResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, color_hex, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("category_budgets")
      .select("id, category_id, limit_amount_idr")
      .eq("user_id", userId)
      .eq("month_start", period.monthStart),
    supabase.rpc("get_category_spending", {
      p_end_date: period.monthEnd,
      p_start_date: period.monthStart,
    }),
  ]);

  if (categoriesResult.error || budgetsResult.error || spendingResult.error) {
    console.error("[Fintrack AI] Ringkasan budget gagal dimuat.", {
      categoryCode: categoriesResult.error?.code,
      budgetCode: budgetsResult.error?.code,
      spendingCode: spendingResult.error?.code,
    });
    throw new BudgetDataError("database");
  }

  try {
    const categories = parseCategories(categoriesResult.data);
    const budgets = z.array(budgetRowSchema).parse(budgetsResult.data);
    const spending = z.array(spendingRowSchema).parse(spendingResult.data);
    const budgetByCategory = new Map(
      budgets.map((budget) => [budget.category_id, budget]),
    );
    const spendingByCategory = new Map(
      spending.map((row) => [row.category_id, row]),
    );
    const rows = categories.map((category) => {
      const budget = budgetByCategory.get(category.id);
      const categorySpending = spendingByCategory.get(category.id);
      const limit = budget?.limit_amount_idr ?? null;
      const spent = categorySpending?.spent_amount_idr ?? 0;

      return {
        category,
        categoryId: category.id,
        id: budget?.id ?? null,
        limitAmountIdr: limit,
        percentage: limit
          ? Math.min(999, Math.round((spent / limit) * 100))
          : 0,
        spentAmountIdr: spent,
        status: getStatus(limit, spent),
        transactionCount: categorySpending?.transaction_count ?? 0,
      } as const;
    });

    return {
      categories: rows,
      exceededCount: rows.filter((row) => row.status === "exceeded").length,
      monthEnd: period.monthEnd,
      monthLabel: period.monthLabel,
      monthStart: period.monthStart,
      nearLimitCount: rows.filter((row) => row.status === "near_limit").length,
      totalBudgetAmountIdr: rows.reduce(
        (total, row) => total + (row.limitAmountIdr ?? 0),
        0,
      ),
      totalSpentAmountIdr: rows.reduce(
        (total, row) => total + row.spentAmountIdr,
        0,
      ),
    };
  } catch (error) {
    console.error("[Fintrack AI] Respons budget tidak valid.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    throw new BudgetDataError("database");
  }
}

async function assertCategoryActive(categoryId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new BudgetDataError("database");
  if (!data) throw new BudgetDataError("category_unavailable");
}

export async function upsertCategoryBudget(
  userId: string,
  input: ParsedBudgetInput,
) {
  await assertCategoryActive(input.categoryId);
  const supabase = await createClient();
  const { error } = await supabase.from("category_budgets").upsert(
    {
      category_id: input.categoryId,
      limit_amount_idr: input.limitAmountIdr,
      month_start: input.monthStart,
      user_id: userId,
    },
    { onConflict: "user_id,category_id,month_start" },
  );
  if (error) throw new BudgetDataError("database");
}

export async function deleteCategoryBudget(
  userId: string,
  categoryId: string,
  monthStart: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("category_budgets")
    .delete()
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .eq("month_start", monthStart);
  if (error) throw new BudgetDataError("database");
}
