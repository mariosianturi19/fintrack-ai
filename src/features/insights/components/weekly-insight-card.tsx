import {
  formatIdr,
  formatTransactionDate,
} from "@/features/transactions/format";

import type { WeeklyInsightState } from "../domain";

type WeeklyInsightCardProps = Readonly<{
  state: WeeklyInsightState;
}>;

function InsightShell({
  children,
  tone = "default",
}: Readonly<{
  children: React.ReactNode;
  tone?: "default" | "warning";
}>) {
  const isWarning = tone === "warning";

  return (
    <aside
      aria-labelledby="weekly-insight-title"
      className={
        isWarning
          ? "min-w-0 rounded-xl border border-warning-ink/30 bg-warning-soft p-5 sm:p-7"
          : "min-w-0 rounded-xl bg-primary-soft p-5 sm:p-7"
      }
    >
      <div
        className={`min-h-full border-l-[3px] pl-4 ${isWarning ? "border-warning-ink" : "border-primary"}`}
      >
        {children}
      </div>
    </aside>
  );
}

export function WeeklyInsightCard({ state }: WeeklyInsightCardProps) {
  if (state.status === "unavailable") {
    return (
      <InsightShell tone="warning">
        <p className="ft-status-badge rounded-sm bg-surface font-body text-xs font-semibold text-warning-ink">
          Insight mingguan
        </p>
        <h2
          className="mt-5 font-display text-[22px] leading-[1.25] font-semibold text-ink"
          id="weekly-insight-title"
        >
          Insight belum dapat diperbarui
        </h2>
        <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
          Ringkasan utama tetap dapat digunakan. Insight akan dicoba lagi pada
          pembaruan terjadwal berikutnya.
        </p>
      </InsightShell>
    );
  }

  if (state.status === "empty" || !state.insight) {
    return (
      <InsightShell>
        <p className="ft-status-badge rounded-sm bg-surface font-body text-xs font-semibold text-primary">
          Insight mingguan
        </p>
        <h2
          className="mt-5 font-display text-[22px] leading-[1.25] font-semibold text-ink"
          id="weekly-insight-title"
        >
          Menunggu satu minggu lengkap
        </h2>
        <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
          Ringkasan akan dibuat setelah ada transaksi pada satu periode Senin
          sampai Minggu yang telah selesai.
        </p>
      </InsightShell>
    );
  }

  const insight = state.insight;

  return (
    <InsightShell>
      <p className="ft-status-badge rounded-sm bg-surface font-body text-xs font-semibold text-primary">
        Insight mingguan
      </p>
      <h2
        className="mt-5 font-display text-[22px] leading-[1.25] font-semibold text-ink"
        id="weekly-insight-title"
      >
        Pola minggu lalu
      </h2>
      <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
        {insight.summary}
      </p>
      <dl className="mt-5 grid gap-4 border-t border-primary/20 pt-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-body text-xs font-semibold tracking-[0.08em] text-ink-secondary uppercase">
            Total
          </dt>
          <dd className="numeric mt-1 font-display text-lg font-semibold text-ink">
            {formatIdr(insight.totalAmountIdr)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-body text-xs font-semibold tracking-[0.08em] text-ink-secondary uppercase">
            Kategori utama
          </dt>
          <dd className="mt-1 font-body text-sm font-semibold text-ink">
            {insight.topCategoryName ?? "Belum tersedia"}
          </dd>
        </div>
      </dl>
      <p className="mt-5 font-body text-xs leading-5 text-ink-secondary">
        {formatTransactionDate(insight.weekStart)}–
        {formatTransactionDate(insight.weekEnd)} · {insight.transactionCount}
        {" transaksi"}
      </p>
    </InsightShell>
  );
}
