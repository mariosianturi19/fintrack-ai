import type { TransactionRecord } from "./domain";

const idNumberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const idDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

const idMonthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatIdr(value: number) {
  return `Rp${idNumberFormatter.format(value)}`;
}

export function formatExpenseIdr(value: number) {
  return `−${formatIdr(value)}`;
}

export function formatTransactionDate(value: string) {
  return idDateFormatter.format(parseDateOnly(value));
}

export function formatTransactionMonth(value: string) {
  return idMonthFormatter.format(parseDateOnly(value));
}

export function getTransactionPrimaryLabel(transaction: TransactionRecord) {
  return (
    transaction.merchant ??
    transaction.notes ??
    `Pengeluaran ${transaction.category.name.toLocaleLowerCase("id-ID")}`
  );
}

export function getTransactionSourceLabel(source: TransactionRecord["source"]) {
  return source === "receipt_ai" ? "AI · Struk" : "Manual";
}

export function getJakartaDateInputValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export type TransactionDateGroup = Readonly<{
  label: string;
  transactions: readonly TransactionRecord[];
}>;

export function groupTransactionsByDate(
  transactions: readonly TransactionRecord[],
  today = getJakartaDateInputValue(),
): readonly TransactionDateGroup[] {
  const currentDate = parseDateOnly(today);
  const currentDay = currentDate.getUTCDay() || 7;
  const weekStart = new Date(currentDate);
  weekStart.setUTCDate(currentDate.getUTCDate() - currentDay + 1);
  const weekStartValue = weekStart.toISOString().slice(0, 10);
  const groups = new Map<string, TransactionRecord[]>();

  for (const transaction of transactions) {
    const label =
      transaction.transactionDate === today
        ? "Hari ini"
        : transaction.transactionDate >= weekStartValue &&
            transaction.transactionDate < today
          ? "Minggu ini"
          : formatTransactionMonth(transaction.transactionDate);
    const group = groups.get(label);

    if (group) {
      group.push(transaction);
    } else {
      groups.set(label, [transaction]);
    }
  }

  return Array.from(groups, ([label, groupedTransactions]) => ({
    label,
    transactions: groupedTransactions,
  }));
}
