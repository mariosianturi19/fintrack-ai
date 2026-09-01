import Link from "next/link";

import { CategoryIcon } from "@/features/transactions/components/category-icon";
import type { TransactionRecord } from "@/features/transactions/domain";
import {
  formatExpenseIdr,
  formatTransactionDate,
  getTransactionPrimaryLabel,
  getTransactionSourceLabel,
} from "@/features/transactions/format";

type RecentTransactionsProps = Readonly<{
  periodLabel: string;
  transactionCount: number;
  transactions: readonly TransactionRecord[];
}>;

export function RecentTransactions({
  periodLabel,
  transactionCount,
  transactions,
}: RecentTransactionsProps) {
  return (
    <section
      aria-labelledby="recent-transactions-title"
      className="flex min-w-0 flex-col rounded-lg border border-border bg-surface p-5 shadow-level-1 sm:p-6"
    >
      <div className="flex min-w-0 items-center justify-between gap-4">
        <h2
          className="font-display text-[22px] leading-7 font-semibold text-ink"
          id="recent-transactions-title"
        >
          Transaksi terbaru
        </h2>
        <Link
          className="inline-flex min-h-11 shrink-0 items-center font-body text-sm font-semibold text-primary hover:text-primary-hover"
          href="/transactions"
        >
          Lihat semua
        </Link>
      </div>

      {transactions.length > 0 ? (
        <ul className="mt-4 min-w-0 divide-y divide-divider">
          {transactions.map((transaction) => (
            <li className="min-w-0" key={transaction.id}>
              <Link
                className="grid min-h-[76px] min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md py-3 transition-colors hover:bg-canvas-subtle sm:px-2"
                href={`/transactions/${transaction.id}`}
              >
                <CategoryIcon category={transaction.category} size="compact" />
                <span className="min-w-0">
                  <span className="block truncate font-body text-sm font-semibold text-ink">
                    {getTransactionPrimaryLabel(transaction)}
                  </span>
                  <span className="mt-1 block font-body text-xs leading-5 text-ink-secondary">
                    {formatTransactionDate(transaction.transactionDate)} ·{" "}
                    {transaction.category.name} ·{" "}
                    {getTransactionSourceLabel(transaction.source)}
                  </span>
                </span>
                <span className="numeric whitespace-nowrap text-right font-body text-sm font-semibold text-expense-ink">
                  {formatExpenseIdr(transaction.amountIdr)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[250px] flex-col justify-center py-8 text-center">
          <h3 className="font-display text-lg font-semibold text-ink">
            Belum ada transaksi.
          </h3>
          <p className="mx-auto mt-2 max-w-[360px] font-body text-sm leading-6 text-ink-secondary">
            Tambahkan pengeluaran pertama agar ringkasan mulai terbentuk.
          </p>
        </div>
      )}

      <p className="mt-auto border-t border-divider pt-4 font-body text-xs leading-5 text-ink-secondary">
        {transactionCount} transaksi · {periodLabel}
      </p>
    </section>
  );
}
