import { PencilSimple } from "@phosphor-icons/react/dist/ssr/PencilSimple";
import Image from "next/image";

import { StatusBadge } from "@/components/ui/status-badge";

import type {
  TransactionCategory,
  TransactionFormValues,
  TransactionRecord,
} from "../domain";
import {
  formatExpenseIdr,
  formatTransactionDate,
  getJakartaDateInputValue,
  getTransactionPrimaryLabel,
  getTransactionSourceLabel,
} from "../format";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { TransactionForm } from "./transaction-form";

type TransactionDetailCardProps = Readonly<{
  categories: readonly TransactionCategory[];
  receiptPreviewUrl: string | null;
  transaction: TransactionRecord;
}>;

export function TransactionDetailCard({
  categories,
  receiptPreviewUrl,
  transaction,
}: TransactionDetailCardProps) {
  const initialValues: TransactionFormValues = {
    amountIdr: String(transaction.amountIdr),
    categoryId: transaction.categoryId,
    notes: transaction.notes ?? "",
    transactionDate: transaction.transactionDate,
  };
  const primaryLabel = getTransactionPrimaryLabel(transaction);

  return (
    <section
      aria-labelledby="transaction-detail-title"
      className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7"
    >
      <div className="flex min-w-0 items-center justify-between gap-4 border-b border-divider pb-5">
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Detail transaksi
          </p>
          <h2
            className="mt-1 font-display text-xl leading-7 font-semibold text-ink"
            id="transaction-detail-title"
          >
            Edit transaksi
          </h2>
        </div>
        <PencilSimple
          aria-hidden="true"
          className="shrink-0 text-primary"
          size={22}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3 border-b border-divider py-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <StatusBadge tone="information">
            {getTransactionSourceLabel(transaction.source)}
          </StatusBadge>
          <h3 className="mt-3 truncate font-display text-lg leading-6 font-semibold text-ink">
            {primaryLabel}
          </h3>
          <p className="mt-1 font-body text-sm text-ink-secondary">
            {formatTransactionDate(transaction.transactionDate)}
          </p>
        </div>
        <p className="numeric whitespace-nowrap font-display text-[26px] leading-8 font-semibold text-expense-ink">
          {formatExpenseIdr(transaction.amountIdr)}
        </p>
      </div>

      <div className="pt-6">
        <TransactionForm
          categories={categories}
          initialValues={initialValues}
          maximumDate={getJakartaDateInputValue()}
          mode="update"
          transactionId={transaction.id}
        />
      </div>

      {transaction.source === "receipt_ai" ? (
        <section
          aria-labelledby="receipt-evidence-title"
          className="mt-6 border-t border-divider pt-6"
        >
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-primary uppercase">
            Bukti privat
          </p>
          <h3
            className="mt-1 font-display text-lg font-semibold text-ink"
            id="receipt-evidence-title"
          >
            Foto dan item yang sudah ditinjau
          </h3>

          {receiptPreviewUrl ? (
            <a
              className="mt-4 block overflow-hidden rounded-lg border border-border bg-canvas-subtle focus:outline-2 focus:outline-offset-3 focus:outline-primary"
              href={receiptPreviewUrl}
              referrerPolicy="no-referrer"
              rel="noreferrer"
              target="_blank"
            >
              <span className="relative block min-h-[280px] sm:min-h-[380px]">
                <Image
                  alt="Preview privat foto struk transaksi"
                  className="object-contain p-3"
                  fill
                  sizes="(min-width: 1280px) 35vw, 100vw"
                  src={receiptPreviewUrl}
                  unoptimized
                />
              </span>
              <span className="block border-t border-divider px-4 py-3 font-body text-xs text-primary">
                Buka preview privat di tab baru · tautan kedaluwarsa dalam 5
                menit
              </span>
            </a>
          ) : (
            <p className="mt-4 rounded-lg border border-border bg-canvas-subtle p-4 font-body text-sm leading-6 text-ink-secondary">
              Preview sedang tidak tersedia. Data transaksi yang sudah ditinjau
              tetap aman.
            </p>
          )}

          <div className="mt-5 min-w-0">
            <h4 className="font-body text-sm font-semibold text-ink">
              Item tersimpan
            </h4>
            {transaction.receiptItems.length > 0 ? (
              <ul className="mt-3 divide-y divide-divider overflow-hidden rounded-lg border border-border">
                {transaction.receiptItems.map((item, index) => (
                  <li
                    className="flex min-w-0 items-start justify-between gap-4 px-4 py-3"
                    key={`${item.name}-${index}`}
                  >
                    <div className="min-w-0">
                      <p className="break-words font-body text-sm font-medium text-ink">
                        {item.name}
                      </p>
                      {item.quantity ? (
                        <p className="mt-1 font-body text-xs text-ink-secondary">
                          Jumlah: {item.quantity}
                        </p>
                      ) : null}
                    </div>
                    <p className="numeric shrink-0 font-body text-sm font-semibold text-ink">
                      {item.totalPriceIdr
                        ? formatExpenseIdr(item.totalPriceIdr)
                        : item.unitPriceIdr
                          ? formatExpenseIdr(item.unitPriceIdr)
                          : "—"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 font-body text-sm text-ink-secondary">
                Tidak ada rincian item yang disimpan.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <div className="mt-5 flex justify-center border-t border-divider pt-4">
        <DeleteTransactionDialog
          amountIdr={transaction.amountIdr}
          label={primaryLabel}
          transactionId={transaction.id}
        />
      </div>
    </section>
  );
}
