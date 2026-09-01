import type { TransactionRecord } from "../transactions/domain";
import type { WeeklyInsightState } from "../insights/domain";
import {
  formatTransactionMonth,
  getJakartaDateInputValue,
} from "../transactions/format";

import type { DashboardPeriod, DashboardSnapshot } from "./domain";

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addOneMonth(value: string) {
  const [year, month] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
}

export function createDashboardPeriod(date = new Date()): DashboardPeriod {
  const today = getJakartaDateInputValue(date);
  const startDate = `${today.slice(0, 7)}-01`;
  const currentDate = parseDateOnly(today);
  const currentDay = currentDate.getUTCDay() || 7;
  const weekStart = new Date(currentDate);
  weekStart.setUTCDate(currentDate.getUTCDate() - currentDay + 1);
  const weekStartDate = weekStart.toISOString().slice(0, 10);

  return {
    endDateExclusive: addOneMonth(startDate),
    label: formatTransactionMonth(startDate),
    queryStartDate: weekStartDate < startDate ? weekStartDate : startDate,
    startDate,
    today,
    weekStartDate,
  };
}

export function createDashboardSnapshot(
  transactions: readonly TransactionRecord[],
  recentTransactions: readonly TransactionRecord[],
  period: DashboardPeriod,
  weeklyInsightState: WeeklyInsightState = {
    insight: null,
    status: "empty",
  },
): DashboardSnapshot {
  const periodTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionDate >= period.startDate &&
      transaction.transactionDate < period.endDateExclusive,
  );
  const weeklyTransactions = transactions.filter(
    (transaction) =>
      transaction.transactionDate >= period.weekStartDate &&
      transaction.transactionDate <= period.today,
  );
  const totalAmountIdr = periodTransactions.reduce(
    (total, transaction) => total + transaction.amountIdr,
    0,
  );
  const weeklyAmountIdr = weeklyTransactions.reduce(
    (total, transaction) => total + transaction.amountIdr,
    0,
  );
  const categoryTotals = new Map<
    string,
    {
      amountIdr: number;
      colorHex: string;
      id: string;
      name: string;
      slug: string;
      sortOrder: number;
    }
  >();

  for (const transaction of periodTransactions) {
    const existing = categoryTotals.get(transaction.categoryId);

    if (existing) {
      existing.amountIdr += transaction.amountIdr;
    } else {
      categoryTotals.set(transaction.categoryId, {
        amountIdr: transaction.amountIdr,
        colorHex: transaction.category.colorHex,
        id: transaction.category.id,
        name: transaction.category.name,
        slug: transaction.category.slug,
        sortOrder: transaction.category.sortOrder,
      });
    }
  }

  const categories = Array.from(categoryTotals.values())
    .sort(
      (left, right) =>
        right.amountIdr - left.amountIdr || left.sortOrder - right.sortOrder,
    )
    .map((category) => ({
      amountIdr: category.amountIdr,
      colorHex: category.colorHex,
      id: category.id,
      name: category.name,
      percentage:
        totalAmountIdr > 0
          ? Math.round((category.amountIdr / totalAmountIdr) * 100)
          : 0,
      slug: category.slug,
    }));

  return {
    categories,
    period,
    recentTransactions,
    totalAmountIdr,
    transactionCount: periodTransactions.length,
    weeklyInsightState,
    weeklyAmountIdr,
    weeklySharePercentage:
      totalAmountIdr > 0
        ? Math.round((weeklyAmountIdr / totalAmountIdr) * 100)
        : 0,
  };
}
