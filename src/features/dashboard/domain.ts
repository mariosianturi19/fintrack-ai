import type { TransactionRecord } from "../transactions/domain";
import type { WeeklyInsightState } from "../insights/domain";
import type { MonthlyInsightState } from "../insights/monthly-domain";
import type { BudgetOverview } from "../budgets/domain";

export type DashboardPeriod = Readonly<{
  endDateExclusive: string;
  label: string;
  queryStartDate: string;
  startDate: string;
  today: string;
  weekStartDate: string;
}>;

export type DashboardCategoryBreakdown = Readonly<{
  amountIdr: number;
  colorHex: string;
  id: string;
  name: string;
  percentage: number;
  slug: string;
}>;

export type DashboardSnapshot = Readonly<{
  budgetOverview: BudgetOverview;
  categories: readonly DashboardCategoryBreakdown[];
  exportAvailable: boolean;
  period: DashboardPeriod;
  recentTransactions: readonly TransactionRecord[];
  monthlyInsightState: MonthlyInsightState;
  totalAmountIdr: number;
  transactionCount: number;
  weeklyInsightState: WeeklyInsightState;
  weeklyAmountIdr: number;
  weeklySharePercentage: number;
}>;
