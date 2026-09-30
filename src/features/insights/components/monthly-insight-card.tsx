import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import Link from "next/link";

import {
  formatIdr,
  formatTransactionDate,
  formatTransactionMonth,
} from "@/features/transactions/format";

import type { MonthlyInsightState } from "../monthly-domain";

export function MonthlyInsightCard({
  state,
}: Readonly<{ state: MonthlyInsightState }>) {
  const insight = state.insight;

  return (
    <article className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-level-1 sm:p-7">
      <p className="font-body text-xs font-semibold tracking-[0.14em] text-ink-secondary uppercase">
        Insight bulanan
      </p>
      {state.status === "ready" && insight ? (
        <>
          <h2 className="mt-3 font-display text-[22px] leading-7 font-semibold text-ink">
            {formatTransactionMonth(insight.monthStart)} dalam ringkas
          </h2>
          <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
            {insight.summary}
          </p>
          <dl className="mt-5 grid min-w-0 gap-4 border-t border-divider pt-5 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="font-body text-xs font-semibold text-ink-secondary">
                Total pengeluaran
              </dt>
              <dd className="numeric mt-1 font-display text-xl font-semibold text-ink">
                {formatIdr(insight.totalAmountIdr)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="font-body text-xs font-semibold text-ink-secondary">
                Hari tertinggi
              </dt>
              <dd className="mt-1 font-body text-sm font-semibold text-ink">
                {insight.peakSpendingDate
                  ? formatTransactionDate(insight.peakSpendingDate)
                  : "Belum tersedia"}
              </dd>
            </div>
          </dl>
          <Link
            className="mt-5 inline-flex min-h-11 items-center gap-2 font-body text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href="/insights/monthly"
          >
            Lihat rincian bulanan
            <ArrowRight aria-hidden="true" size={17} weight="bold" />
          </Link>
        </>
      ) : (
        <>
          <h2 className="mt-3 font-display text-[22px] leading-7 font-semibold text-ink">
            {state.status === "unavailable"
              ? "Insight belum dapat dimuat"
              : "Menunggu satu bulan lengkap"}
          </h2>
          <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
            {state.status === "unavailable"
              ? "Data utama tetap aman. Ringkasan bulanan akan dicoba lagi pada jadwal berikutnya."
              : "Insight dibuat setelah terdapat transaksi pada satu bulan yang sudah selesai."}
          </p>
        </>
      )}
    </article>
  );
}
