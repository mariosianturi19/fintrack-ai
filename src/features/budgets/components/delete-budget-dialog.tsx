"use client";

import { ShieldWarning } from "@phosphor-icons/react/ShieldWarning";
import { Trash } from "@phosphor-icons/react/Trash";
import { useId, useRef } from "react";
import { useFormStatus } from "react-dom";

import { formatIdr } from "@/features/transactions/format";

import { deleteCategoryBudgetAction } from "../actions";

function DeleteBudgetActions({
  closeDialog,
}: Readonly<{ closeDialog: () => void }>) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
      <button
        autoFocus
        className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        onClick={closeDialog}
        type="button"
      >
        Batal
      </button>
      <button
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-error px-5 font-body text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        <Trash aria-hidden="true" size={17} weight="bold" />
        {pending ? "Menghapus..." : "Hapus budget"}
      </button>
    </div>
  );
}

type DeleteBudgetDialogProps = Readonly<{
  categoryId: string;
  categoryName: string;
  limitAmountIdr: number;
  monthLabel: string;
  monthStart: string;
}>;

export function DeleteBudgetDialog({
  categoryId,
  categoryName,
  limitAmountIdr,
  monthLabel,
  monthStart,
}: DeleteBudgetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-3 font-body text-sm font-semibold text-error transition-colors hover:bg-error-soft"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <Trash aria-hidden="true" size={17} />
        Hapus budget
      </button>

      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[640px] overflow-y-auto rounded-xl border border-error bg-surface p-0 text-ink shadow-level-3 backdrop:bg-ink/60"
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="min-w-0 p-5 sm:p-8">
          <div className="flex min-w-0 items-start justify-between gap-4">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-error-soft text-error"
            >
              <Trash size={22} weight="bold" />
            </span>
            <span className="rounded-sm bg-error-soft px-3 py-2 font-body text-[11px] font-semibold tracking-[0.08em] text-error uppercase">
              Hapus batas
            </span>
          </div>

          <h2
            className="mt-5 font-display text-[26px] leading-[1.2] font-semibold tracking-[-0.02em] text-ink [overflow-wrap:anywhere]"
            id={titleId}
          >
            Hapus budget {categoryName}?
          </h2>
          <p
            className="mt-3 font-body text-sm leading-6 text-ink-secondary sm:text-base"
            id={descriptionId}
          >
            Batas {formatIdr(limitAmountIdr)} untuk {monthLabel} akan dihapus.
            Transaksi dan pengeluaran yang sudah tercatat tidak ikut terhapus.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-lg bg-error-soft p-4 text-error">
            <ShieldWarning
              aria-hidden="true"
              className="mt-0.5 shrink-0"
              size={19}
              weight="bold"
            />
            <p className="font-body text-sm leading-6 font-semibold">
              Peringatan kategori ini akan berhenti sampai budget diatur lagi.
            </p>
          </div>

          <form action={deleteCategoryBudgetAction}>
            <input name="categoryId" type="hidden" value={categoryId} />
            <input name="monthStart" type="hidden" value={monthStart} />
            <DeleteBudgetActions closeDialog={closeDialog} />
          </form>
        </div>
      </dialog>
    </>
  );
}
