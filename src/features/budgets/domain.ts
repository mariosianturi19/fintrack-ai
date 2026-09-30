import type { TransactionCategory } from "@/features/transactions/domain";

export type BudgetStatus = "not_set" | "on_track" | "near_limit" | "exceeded";

export type CategoryBudget = Readonly<{
  category: TransactionCategory;
  categoryId: string;
  id: string | null;
  limitAmountIdr: number | null;
  percentage: number;
  spentAmountIdr: number;
  status: BudgetStatus;
  transactionCount: number;
}>;

export type BudgetOverview = Readonly<{
  categories: readonly CategoryBudget[];
  exceededCount: number;
  monthEnd: string;
  monthLabel: string;
  monthStart: string;
  nearLimitCount: number;
  totalBudgetAmountIdr: number;
  totalSpentAmountIdr: number;
}>;
