import type { TransactionRecord } from "../transactions/domain";
import type { WeeklyInsightState } from "../insights/domain";

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
  categories: readonly DashboardCategoryBreakdown[];
  period: DashboardPeriod;
  recentTransactions: readonly TransactionRecord[];
  totalAmountIdr: number;
  transactionCount: number;
  weeklyInsightState: WeeklyInsightState;
  weeklyAmountIdr: number;
  weeklySharePercentage: number;
}>;
