"use client";

import { FloppyDisk } from "@phosphor-icons/react/FloppyDisk";
import { Plus } from "@phosphor-icons/react/Plus";
import { Trash } from "@phosphor-icons/react/Trash";
import Image from "next/image";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { AmountInput } from "@/features/transactions/components/amount-input";
import type { TransactionCategory } from "@/features/transactions/domain";

import { saveReceiptTransactionAction } from "../actions";
import type { ReceiptAnalysisResult, ReceiptReviewItem } from "../domain";
import type { ReceiptReviewActionState } from "../review-validation";

type EditableReceiptItem = {
  name: string;
  quantity: string;
  totalPriceIdr: string;
  unitPriceIdr: string;
};

type ReceiptReviewFormProps = Readonly<{
  analysis: ReceiptAnalysisResult;
  categories: readonly TransactionCategory[];
  maximumDate: string;
  onManualFallback: () => void;
  previewUrl: string;
}>;

const initialActionState: ReceiptReviewActionState = {
  fieldErrors: {},
  status: "idle",
};

function toEditableItem(item: ReceiptReviewItem): EditableReceiptItem {
  return {
    name: item.name,
    quantity: item.quantity ?? "",
    totalPriceIdr: item.totalPriceIdr ? String(item.totalPriceIdr) : "",
    unitPriceIdr: item.unitPriceIdr ? String(item.unitPriceIdr) : "",
  };
}

function FieldError({
  id,
  message,
}: Readonly<{ id: string; message?: string }>) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 font-body text-xs leading-5 text-error" id={id}>
      {message}
    </p>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-5 font-body text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:bg-disabled-bg disabled:text-disabled-ink"
      disabled={pending}
      type="submit"
    >
      <FloppyDisk aria-hidden="true" size={19} weight="bold" />
      {pending ? "Menyimpan..." : "Simpan transaksi"}
    </button>
  );
}

export function ReceiptReviewForm({
  analysis,
  categories,
  maximumDate,
  onManualFallback,
  previewUrl,
}: ReceiptReviewFormProps) {
  const [state, formAction] = useActionState(
    saveReceiptTransactionAction,
    initialActionState,
  );
  const [items, setItems] = useState<EditableReceiptItem[]>(
    analysis.draft.items.map(toEditableItem),
  );
  const categoryId =
    categories.find((category) => category.slug === analysis.draft.categorySlug)
      ?.id ?? "";

  function updateItem(
    index: number,
    field: keyof EditableReceiptItem,
    value: string,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  return (
    <section aria-labelledby="receipt-review-title" className="min-w-0">
      <div className="mb-5 rounded-lg border border-primary bg-primary-soft p-4 sm:p-5">
        <p className="font-body text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          Hasil AI perlu ditinjau
        </p>
        <h2
          className="mt-1 font-display text-2xl font-semibold tracking-[-0.02em] text-ink"
          id="receipt-review-title"
        >
          Periksa sebelum menyimpan.
        </h2>
        <p className="mt-2 font-body text-sm leading-6 text-ink-secondary">
          AI dapat keliru. Semua field di bawah dapat kamu koreksi dan belum ada
          transaksi yang disimpan.
        </p>
        {analysis.reviewIssues.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 font-body text-sm leading-6 text-ink-secondary">
            {analysis.reviewIssues.map((issue) => (
              <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface shadow-level-1 lg:sticky lg:top-6">
          <div className="relative min-h-[360px] bg-canvas-subtle sm:min-h-[480px]">
            <Image
              alt="Foto struk yang sedang ditinjau"
              className="object-contain p-4"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              src={previewUrl}
              unoptimized
            />
          </div>
          <p className="border-t border-divider px-4 py-3 font-body text-xs leading-5 text-ink-secondary">
            Foto hanya dipakai untuk pemeriksaan ini dan disimpan privat setelah
            kamu mengonfirmasi transaksi.
          </p>
        </div>

        <form
          action={formAction}
          className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7"
          noValidate
        >
          <input name="uploadId" type="hidden" value={analysis.uploadId} />
          <input name="items" type="hidden" value={JSON.stringify(items)} />

          {state.formError ? (
            <div
              className="mb-5 rounded-lg border border-error bg-error-soft p-4 font-body text-sm leading-6 text-error"
              role="alert"
            >
              {state.formError}
            </div>
          ) : null}

          <div className="grid min-w-0 gap-5">
            <div className="min-w-0">
              <label
                className="mb-2 block font-body text-sm font-medium text-ink-secondary"
                htmlFor="merchant"
              >
                Merchant <span className="text-ink-warm-muted">(opsional)</span>
              </label>
              <input
                aria-describedby={
                  state.fieldErrors.merchant ? "merchant-error" : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.merchant)}
                className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 py-3 font-body text-base text-ink outline-none transition-colors focus:border-primary"
                defaultValue={analysis.draft.merchant ?? ""}
                id="merchant"
                maxLength={120}
                name="merchant"
                type="text"
              />
              <FieldError
                id="merchant-error"
                message={state.fieldErrors.merchant}
              />
            </div>

            <div className="min-w-0">
              <label
                className="mb-2 block font-body text-sm font-medium text-ink-secondary"
                htmlFor="amountIdr"
              >
                Total pengeluaran
              </label>
              <AmountInput
                defaultValue={
                  analysis.draft.amountIdr
                    ? String(analysis.draft.amountIdr)
                    : ""
                }
                describedBy={
                  state.fieldErrors.amountIdr
                    ? "receipt-amount-error"
                    : undefined
                }
                hasError={Boolean(state.fieldErrors.amountIdr)}
              />
              <FieldError
                id="receipt-amount-error"
                message={state.fieldErrors.amountIdr}
              />
            </div>

            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <label
                  className="mb-2 block font-body text-sm font-medium text-ink-secondary"
                  htmlFor="transactionDate"
                >
                  Tanggal
                </label>
                <input
                  aria-describedby={
                    state.fieldErrors.transactionDate
                      ? "receipt-date-error"
                      : undefined
                  }
                  aria-invalid={Boolean(state.fieldErrors.transactionDate)}
                  className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 py-3 font-body text-base text-ink outline-none transition-colors focus:border-primary"
                  defaultValue={analysis.draft.transactionDate ?? ""}
                  id="transactionDate"
                  max={maximumDate}
                  name="transactionDate"
                  required
                  type="date"
                />
                <FieldError
                  id="receipt-date-error"
                  message={state.fieldErrors.transactionDate}
                />
              </div>

              <div className="min-w-0">
                <label
                  className="mb-2 block font-body text-sm font-medium text-ink-secondary"
                  htmlFor="categoryId"
                >
                  Kategori
                </label>
                <select
                  aria-describedby={
                    state.fieldErrors.categoryId
                      ? "receipt-category-error"
                      : undefined
                  }
                  aria-invalid={Boolean(state.fieldErrors.categoryId)}
                  className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 py-3 font-body text-base text-ink outline-none transition-colors focus:border-primary"
                  defaultValue={categoryId}
                  id="categoryId"
                  name="categoryId"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  id="receipt-category-error"
                  message={state.fieldErrors.categoryId}
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-body text-sm font-semibold text-ink">
                    Item struk
                  </h3>
                  <p className="mt-1 font-body text-xs text-ink-secondary">
                    Hapus item yang salah atau tambahkan yang terlewat.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md border border-primary bg-surface px-3 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
                  disabled={items.length >= 100}
                  onClick={() =>
                    setItems((current) => [
                      ...current,
                      {
                        name: "",
                        quantity: "",
                        totalPriceIdr: "",
                        unitPriceIdr: "",
                      },
                    ])
                  }
                  type="button"
                >
                  <Plus aria-hidden="true" size={17} />
                  Tambah
                </button>
              </div>

              <div className="grid min-w-0 gap-3">
                {items.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border p-4 font-body text-sm leading-6 text-ink-secondary">
                    Tidak ada item yang disimpan. Ringkasan transaksi tetap
                    dapat disimpan.
                  </p>
                ) : null}
                {items.map((item, index) => (
                  <div
                    className="min-w-0 rounded-lg border border-divider p-4"
                    key={`${analysis.requestId}-${index}`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <label className="min-w-0 flex-1 font-body text-xs font-medium text-ink-secondary">
                        Nama item
                        <input
                          className="mt-2 min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 font-body text-sm text-ink outline-none focus:border-primary"
                          maxLength={160}
                          onChange={(event) =>
                            updateItem(index, "name", event.currentTarget.value)
                          }
                          required
                          type="text"
                          value={item.name}
                        />
                      </label>
                      <button
                        aria-label={`Hapus item ${index + 1}`}
                        className="mt-6 inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-error text-error hover:bg-error-soft"
                        onClick={() =>
                          setItems((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        type="button"
                      >
                        <Trash aria-hidden="true" size={18} />
                      </button>
                    </div>
                    <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-3">
                      {(
                        [
                          ["quantity", "Jumlah"],
                          ["unitPriceIdr", "Harga satuan"],
                          ["totalPriceIdr", "Subtotal"],
                        ] as const
                      ).map(([field, label]) => (
                        <label
                          className="min-w-0 font-body text-xs text-ink-secondary"
                          key={field}
                        >
                          {label}
                          <input
                            className="mt-2 min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 font-body text-sm text-ink outline-none focus:border-primary"
                            inputMode={
                              field === "quantity" ? "text" : "numeric"
                            }
                            maxLength={field === "quantity" ? 60 : undefined}
                            onChange={(event) =>
                              updateItem(
                                index,
                                field,
                                event.currentTarget.value,
                              )
                            }
                            type="text"
                            value={item[field]}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <FieldError
                id="receipt-items-error"
                message={state.fieldErrors.items}
              />
            </div>

            <div className="min-w-0">
              <label
                className="mb-2 block font-body text-sm font-medium text-ink-secondary"
                htmlFor="notes"
              >
                Catatan <span className="text-ink-warm-muted">(opsional)</span>
              </label>
              <textarea
                aria-describedby={
                  state.fieldErrors.notes ? "receipt-notes-error" : undefined
                }
                aria-invalid={Boolean(state.fieldErrors.notes)}
                className="min-h-24 w-full min-w-0 resize-y rounded-md border border-border bg-surface px-4 py-3 font-body text-base leading-6 text-ink outline-none focus:border-primary"
                defaultValue={analysis.draft.notes ?? ""}
                id="notes"
                maxLength={1000}
                name="notes"
              />
              <FieldError
                id="receipt-notes-error"
                message={state.fieldErrors.notes}
              />
            </div>
          </div>

          <div className="mt-7 border-t border-divider pt-6">
            <SaveButton />
            <button
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
              onClick={onManualFallback}
              type="button"
            >
              Batalkan dan input manual
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
