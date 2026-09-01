"use client";

import { ArrowClockwise } from "@phosphor-icons/react/ArrowClockwise";
import { WarningCircle } from "@phosphor-icons/react/WarningCircle";
import { useEffect } from "react";

export default function TransactionsError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error("[Fintrack AI] Halaman transaksi gagal dimuat.", error);
  }, [error]);

  return (
    <section
      aria-labelledby="transaction-error-title"
      className="flex min-h-[420px] min-w-0 flex-col items-center justify-center rounded-xl border border-error bg-surface px-5 py-12 text-center shadow-level-1"
    >
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-error-soft text-error"
      >
        <WarningCircle size={28} weight="bold" />
      </span>
      <h1
        className="mt-5 font-display text-[26px] leading-8 font-semibold text-ink"
        id="transaction-error-title"
      >
        Transaksi belum dapat dimuat.
      </h1>
      <p className="mt-2 max-w-[520px] font-body text-sm leading-6 text-ink-secondary">
        Data tidak dihapus atau diubah. Periksa koneksi lalu coba memuat ulang
        halaman ini.
      </p>
      <button
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        onClick={reset}
        type="button"
      >
        <ArrowClockwise aria-hidden="true" size={18} weight="bold" />
        Coba lagi
      </button>
    </section>
  );
}
