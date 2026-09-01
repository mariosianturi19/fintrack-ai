"use client";

import { ShieldWarning } from "@phosphor-icons/react/ShieldWarning";
import { Trash } from "@phosphor-icons/react/Trash";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { deleteTransactionAction } from "../actions";
import type { TransactionActionState } from "../domain";
import { formatIdr } from "../format";
import { createInitialActionState } from "../state";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-error px-5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      <Trash aria-hidden="true" size={17} weight="bold" />
      {pending ? "Menghapus..." : "Hapus transaksi"}
    </button>
  );
}

type DeleteTransactionDialogProps = Readonly<{
  amountIdr: number;
  label: string;
  transactionId: string;
}>;

export function DeleteTransactionDialog({
  amountIdr,
  label,
  transactionId,
}: DeleteTransactionDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState<TransactionActionState, FormData>(
    deleteTransactionAction.bind(null, transactionId),
    createInitialActionState({
      amountIdr: "",
      categoryId: "",
      notes: "",
      transactionDate: "",
    }),
  );

  useEffect(() => {
    if (state.status === "error" && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
      setOpen(true);
    }
  }, [state]);

  function openDialog() {
    dialogRef.current?.showModal();
    setOpen(true);
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function handleClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 font-body text-sm font-semibold text-error transition-colors hover:bg-error-soft"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <Trash aria-hidden="true" size={18} weight="bold" />
        Hapus transaksi
      </button>

      <dialog
        aria-labelledby="delete-transaction-title"
        className="m-auto w-[calc(100%-2rem)] max-w-[680px] rounded-xl border border-error bg-surface p-0 text-ink shadow-level-3 backdrop:bg-ink/60"
        onCancel={() => setOpen(false)}
        onClose={handleClose}
        ref={dialogRef}
      >
        {open ? (
          <div className="min-w-0 p-5 sm:p-8">
            <div className="flex min-w-0 items-start justify-between gap-4">
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error-soft text-error"
              >
                <Trash size={22} weight="bold" />
              </span>
              <span className="rounded-sm bg-error-soft px-3 py-2 font-body text-[11px] font-semibold tracking-[0.08em] text-error uppercase">
                Destructive
              </span>
            </div>

            <h2
              className="mt-5 font-display text-[26px] leading-[1.2] font-semibold tracking-[-0.02em] text-ink [overflow-wrap:anywhere]"
              id="delete-transaction-title"
            >
              Hapus transaksi {label}?
            </h2>
            <p className="mt-3 font-body text-sm leading-6 text-ink-secondary sm:text-base">
              Transaksi {formatIdr(amountIdr)} akan dihapus dari riwayat
              pengeluaran. Tindakan ini tidak dapat dibatalkan.
            </p>

            {state.formError ? (
              <p
                className="mt-5 rounded-lg border border-error bg-error-soft p-4 font-body text-sm leading-6 text-error"
                role="alert"
              >
                {state.formError}
              </p>
            ) : (
              <div className="mt-6 flex items-start gap-3 rounded-lg bg-error-soft p-4 text-error">
                <ShieldWarning
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  size={19}
                  weight="bold"
                />
                <p className="font-body text-sm leading-6 font-semibold">
                  Fokus awal berada pada Batal. Escape menutup dialog.
                </p>
              </div>
            )}

            <form
              action={formAction}
              className="mt-6 flex flex-col-reverse gap-3 sm:flex-row"
            >
              <button
                autoFocus
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                onClick={closeDialog}
                type="button"
              >
                Batal
              </button>
              <DeleteSubmitButton />
            </form>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
