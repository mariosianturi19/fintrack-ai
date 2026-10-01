"use client";

import { Trash } from "@phosphor-icons/react/Trash";
import { useId, useRef } from "react";

import { deleteWalletAction } from "../actions";

type RemoveWalletDialogProps = Readonly<{
  name: string;
  receiptCount: number;
  transactionCount: number;
  walletId: string;
}>;

export function RemoveWalletDialog({
  name,
  receiptCount,
  transactionCount,
  walletId,
}: RemoveWalletDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 font-body text-sm font-semibold text-error hover:bg-error-soft"
        onClick={() => dialogRef.current?.showModal()}
        ref={triggerRef}
        type="button"
      >
        <Trash aria-hidden="true" size={17} />
        Hapus
      </button>
      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[640px] overflow-y-auto rounded-xl border border-error bg-surface p-0 text-ink shadow-level-3 backdrop:bg-ink/60"
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="p-5 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-error-soft text-error">
            <Trash aria-hidden="true" size={23} weight="bold" />
          </span>
          <h3
            className="mt-5 font-display text-[26px] leading-tight font-semibold text-ink"
            id={titleId}
          >
            Hapus dompet {name}?
          </h3>
          <p
            className="mt-3 font-body text-sm leading-6 text-ink-secondary sm:text-base"
            id={descriptionId}
          >
            {transactionCount} transaksi dan {receiptCount} foto struk di dompet
            ini akan dihapus permanen. Insight tersimpan yang sudah tidak valid
            juga akan dibersihkan. Budget bulanan tetap aman karena berlaku
            untuk seluruh dompet. Tindakan ini tidak dapat dibatalkan.
          </p>
          <form action={deleteWalletAction} className="mt-6">
            <input name="walletId" type="hidden" value={walletId} />
            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                autoFocus
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                Batal
              </button>
              <button
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-error px-5 font-body text-sm font-semibold text-white"
                type="submit"
              >
                <Trash aria-hidden="true" size={17} weight="bold" />
                Hapus dompet dan transaksinya
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
