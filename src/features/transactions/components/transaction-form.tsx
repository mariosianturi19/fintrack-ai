"use client";

import { FloppyDisk } from "@phosphor-icons/react/FloppyDisk";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createTransactionAction, updateTransactionAction } from "../actions";
import type {
  TransactionActionState,
  TransactionCategory,
  TransactionFormValues,
} from "../domain";
import { createInitialActionState } from "../state";
import { AmountInput } from "./amount-input";

type TransactionFormProps = Readonly<{
  categories: readonly TransactionCategory[];
  initialValues: TransactionFormValues;
  maximumDate: string;
  mode: "create" | "update";
  transactionId?: string;
}>;

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

function SubmitButton({ mode }: { mode: TransactionFormProps["mode"] }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-5 font-body text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:bg-disabled-bg disabled:text-disabled-ink"
      disabled={pending}
      type="submit"
    >
      <FloppyDisk aria-hidden="true" size={18} weight="bold" />
      {pending
        ? "Menyimpan..."
        : mode === "create"
          ? "Simpan transaksi"
          : "Simpan perubahan"}
    </button>
  );
}

export function TransactionForm({
  categories,
  initialValues,
  maximumDate,
  mode,
  transactionId,
}: TransactionFormProps) {
  const action =
    mode === "create"
      ? createTransactionAction
      : updateTransactionAction.bind(null, transactionId ?? "");
  const [state, formAction] = useActionState<TransactionActionState, FormData>(
    action,
    createInitialActionState(initialValues),
  );

  const amountErrorId = state.fieldErrors.amountIdr
    ? "amountIdr-error"
    : undefined;
  const categoryErrorId = state.fieldErrors.categoryId
    ? "categoryId-error"
    : undefined;
  const dateErrorId = state.fieldErrors.transactionDate
    ? "transactionDate-error"
    : undefined;
  const notesErrorId = state.fieldErrors.notes ? "notes-error" : undefined;

  return (
    <form action={formAction} className="min-w-0" noValidate>
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
            htmlFor="amountIdr"
          >
            Total pengeluaran
          </label>
          <AmountInput
            defaultValue={state.values.amountIdr}
            describedBy={amountErrorId}
            hasError={Boolean(state.fieldErrors.amountIdr)}
          />
          <FieldError
            id="amountIdr-error"
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
              aria-describedby={dateErrorId}
              aria-invalid={Boolean(state.fieldErrors.transactionDate)}
              className={[
                "min-h-12 w-full min-w-0 rounded-md border bg-surface px-4 py-3 font-body text-base text-ink outline-none transition-colors",
                state.fieldErrors.transactionDate
                  ? "border-error focus:border-error"
                  : "border-border focus:border-primary",
              ].join(" ")}
              defaultValue={state.values.transactionDate}
              id="transactionDate"
              max={maximumDate}
              name="transactionDate"
              required
              type="date"
            />
            <FieldError
              id="transactionDate-error"
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
              aria-describedby={categoryErrorId}
              aria-invalid={Boolean(state.fieldErrors.categoryId)}
              className={[
                "min-h-12 w-full min-w-0 rounded-md border bg-surface px-4 py-3 font-body text-base text-ink outline-none transition-colors",
                state.fieldErrors.categoryId
                  ? "border-error focus:border-error"
                  : "border-border focus:border-primary",
              ].join(" ")}
              defaultValue={state.values.categoryId}
              id="categoryId"
              name="categoryId"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.isActive ? "" : " · Tidak aktif"}
                </option>
              ))}
            </select>
            <FieldError
              id="categoryId-error"
              message={state.fieldErrors.categoryId}
            />
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              className="font-body text-sm font-medium text-ink-secondary"
              htmlFor="notes"
            >
              Catatan
            </label>
            <span className="font-body text-xs text-ink-warm-muted">
              Opsional
            </span>
          </div>
          <textarea
            aria-describedby={notesErrorId}
            aria-invalid={Boolean(state.fieldErrors.notes)}
            className={[
              "min-h-28 w-full min-w-0 resize-y rounded-md border bg-surface px-4 py-3 font-body text-base leading-6 text-ink outline-none transition-colors",
              state.fieldErrors.notes
                ? "border-error focus:border-error"
                : "border-border focus:border-primary",
            ].join(" ")}
            defaultValue={state.values.notes}
            id="notes"
            maxLength={1000}
            name="notes"
            placeholder="Contoh: Belanja kebutuhan rumah"
          />
          <FieldError id="notes-error" message={state.fieldErrors.notes} />
        </div>
      </div>

      <div className="mt-7 border-t border-divider pt-6">
        <SubmitButton mode={mode} />
        <p className="mt-3 text-center font-body text-xs leading-5 text-ink-secondary">
          Data baru tersimpan setelah kamu menekan tombol.
        </p>
      </div>
    </form>
  );
}
