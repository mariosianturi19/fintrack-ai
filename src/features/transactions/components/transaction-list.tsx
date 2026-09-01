import { CaretLeft } from "@phosphor-icons/react/dist/ssr/CaretLeft";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
import Link from "next/link";

import { ActionLink } from "@/components/ui/action-link";

import type { TransactionPage } from "../domain";
import {
  formatExpenseIdr,
  formatTransactionDate,
  getTransactionPrimaryLabel,
  getTransactionSourceLabel,
  groupTransactionsByDate,
} from "../format";
import { CategoryIcon } from "./category-icon";

type TransactionListProps = Readonly<{
  page: TransactionPage;
  selectedTransactionId?: string;
  showPagination?: boolean;
}>;

function PaginationLink({
  children,
  disabled,
  href,
}: Readonly<{
  children: React.ReactNode;
  disabled: boolean;
  href: string;
}>) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-disabled-bg px-4 font-body text-sm font-semibold text-disabled-ink"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary bg-surface px-4 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
      href={href}
    >
      {children}
    </Link>
  );
}

export function TransactionList({
  page,
  selectedTransactionId,
  showPagination = true,
}: TransactionListProps) {
  if (page.transactions.length === 0) {
    return (
      <section className="flex min-h-[360px] min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-surface px-5 py-12 text-center shadow-level-1">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-lg bg-primary-soft text-primary"
        >
          <Receipt size={27} weight="regular" />
        </span>
        <h2 className="mt-5 font-display text-[22px] leading-7 font-semibold text-ink">
          Belum ada transaksi.
        </h2>
        <p className="mt-2 max-w-[440px] font-body text-sm leading-6 text-ink-secondary">
          Tambahkan pengeluaran pertamamu secara manual. Scan struk akan
          tersedia pada checkpoint integrasi berikutnya.
        </p>
        <div className="mt-6">
          <ActionLink
            href="/transactions/new"
            icon={<Plus size={18} weight="bold" />}
          >
            Tambah transaksi
          </ActionLink>
        </div>
      </section>
    );
  }

  const groups = groupTransactionsByDate(page.transactions);

  return (
    <section
      aria-label="Daftar transaksi"
      className="min-w-0 rounded-xl border border-border bg-surface shadow-level-1"
    >
      <div className="hidden grid-cols-[minmax(0,1fr)_140px_150px] gap-4 border-b border-divider px-5 py-4 font-body text-[11px] font-semibold tracking-[0.14em] text-ink-secondary uppercase md:grid">
        <span>Catatan / kategori</span>
        <span>Tanggal</span>
        <span className="text-right">Nominal</span>
      </div>

      <div className="min-w-0 px-3 py-2 sm:px-4 sm:py-3">
        {groups.map((group) => (
          <div className="min-w-0" key={group.label}>
            <h2 className="px-2 pt-4 pb-2 font-display text-sm leading-5 font-semibold text-ink first:pt-2">
              {group.label}
            </h2>
            <div className="min-w-0 divide-y divide-divider">
              {group.transactions.map((transaction) => {
                const selected = transaction.id === selectedTransactionId;

                return (
                  <Link
                    aria-current={selected ? "true" : undefined}
                    className={[
                      "grid min-h-[76px] min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-3 transition-colors md:grid-cols-[auto_minmax(0,1fr)_140px_150px] md:gap-4",
                      selected
                        ? "bg-primary-soft ring-1 ring-primary"
                        : "hover:bg-canvas-subtle",
                    ].join(" ")}
                    href={`/transactions/${transaction.id}`}
                    key={transaction.id}
                  >
                    <CategoryIcon category={transaction.category} />
                    <span className="min-w-0">
                      <span className="block truncate font-body text-[15px] leading-5 font-semibold text-ink">
                        {getTransactionPrimaryLabel(transaction)}
                      </span>
                      <span className="mt-1 block min-w-0 font-body text-xs leading-4 text-ink-secondary">
                        {transaction.category.name} ·{" "}
                        {getTransactionSourceLabel(transaction.source)}
                      </span>
                      <span className="mt-1 block font-body text-xs leading-4 text-ink-secondary md:hidden">
                        {formatTransactionDate(transaction.transactionDate)}
                      </span>
                    </span>
                    <span className="hidden font-body text-sm leading-5 text-ink-secondary md:block">
                      {formatTransactionDate(transaction.transactionDate)}
                    </span>
                    <span className="numeric whitespace-nowrap text-right font-body text-sm leading-5 font-semibold text-expense-ink">
                      {formatExpenseIdr(transaction.amountIdr)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="flex min-w-0 flex-col gap-3 border-t border-divider px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs leading-5 text-ink-secondary">
          Menampilkan {page.transactions.length} dari {page.total} transaksi
        </p>
        {showPagination && page.pageCount > 1 ? (
          <nav
            aria-label="Halaman transaksi"
            className="flex items-center gap-2"
          >
            <PaginationLink
              disabled={page.currentPage <= 1}
              href={`/transactions?page=${page.currentPage - 1}`}
            >
              <CaretLeft aria-hidden="true" size={16} weight="bold" />
              Sebelumnya
            </PaginationLink>
            <span className="numeric px-1 font-body text-xs text-ink-secondary">
              {page.currentPage}/{page.pageCount}
            </span>
            <PaginationLink
              disabled={page.currentPage >= page.pageCount}
              href={`/transactions?page=${page.currentPage + 1}`}
            >
              Berikutnya
              <CaretRight aria-hidden="true" size={16} weight="bold" />
            </PaginationLink>
          </nav>
        ) : null}
      </footer>
    </section>
  );
}
