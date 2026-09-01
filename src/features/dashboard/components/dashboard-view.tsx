import { FileCsv } from "@phosphor-icons/react/dist/ssr/FileCsv";
import { FileXls } from "@phosphor-icons/react/dist/ssr/FileXls";
import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";

import { ActionLink } from "@/components/ui/action-link";
import {
  formatIdr,
  formatTransactionDate,
} from "@/features/transactions/format";
import { WeeklyInsightCard } from "@/features/insights/components/weekly-insight-card";

import type { DashboardSnapshot } from "../domain";
import { CategoryExpenseChart } from "./category-expense-chart";
import { RecentTransactions } from "./recent-transactions";

type DashboardViewProps = Readonly<{
  snapshot: DashboardSnapshot;
}>;

function ExportLink({
  disabled,
  format,
}: Readonly<{
  disabled: boolean;
  format: "csv" | "xlsx";
}>) {
  const label = format === "csv" ? "Export CSV" : "Export Excel";
  const Icon = format === "csv" ? FileCsv : FileXls;
  const classes =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md border px-4 font-body text-sm font-semibold";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${classes} border-border bg-disabled-bg text-disabled-ink`}
      >
        <Icon aria-hidden="true" size={18} weight="regular" />
        {label}
      </span>
    );
  }

  return (
    <a
      className={`${classes} border-primary bg-surface text-primary transition-colors hover:bg-primary-soft hover:text-primary-hover`}
      download
      href={`/api/exports/transactions?format=${format}`}
    >
      <Icon aria-hidden="true" size={18} weight="regular" />
      {label}
    </a>
  );
}

export function DashboardView({ snapshot }: DashboardViewProps) {
  const largestCategory = snapshot.categories[0];
  const hasTransactions = snapshot.recentTransactions.length > 0;

  return (
    <div className="mt-7 min-w-0">
      <section
        aria-label={`Ringkasan pengeluaran ${snapshot.period.label}`}
        className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-6"
      >
        <article className="min-w-0 md:rounded-xl md:border md:border-border md:bg-surface md:p-7 md:shadow-level-1 xl:p-8">
          <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(176px,0.36fr)] md:gap-7">
            <div className="min-w-0">
              <p className="font-body text-xs font-semibold tracking-[0.14em] text-ink-secondary uppercase">
                Total pengeluaran
              </p>
              <p className="numeric mt-3 font-display text-[36px] leading-[1.08] font-semibold tracking-[-0.035em] text-ink sm:text-[40px]">
                {formatIdr(snapshot.totalAmountIdr)}
              </p>
              <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
                {snapshot.transactionCount > 0
                  ? `${snapshot.transactionCount} transaksi tercatat pada ${snapshot.period.label}.`
                  : `Belum ada transaksi pada ${snapshot.period.label}.`}
              </p>
            </div>

            <div className="ft-dashboard-weekly min-w-0 border-t border-divider pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-7">
              <p
                aria-label="Pengeluaran minggu ini"
                className="font-body text-xs font-semibold tracking-[0.14em] text-ink-secondary uppercase"
              >
                Minggu ini
              </p>
              <p className="numeric mt-3 font-display text-[26px] leading-tight font-semibold text-ink">
                {formatIdr(snapshot.weeklyAmountIdr)}
              </p>
              <p className="mt-2 font-body text-sm leading-6 text-ink-secondary">
                {snapshot.period.weekStartDate < snapshot.period.startDate
                  ? `Sejak ${formatTransactionDate(snapshot.period.weekStartDate)} dan melintasi pergantian bulan`
                  : snapshot.totalAmountIdr > 0
                    ? `${snapshot.weeklySharePercentage}% dari total bulan ini`
                    : "Ringkasan akan muncul setelah transaksi pertama"}
              </p>
              <div className="mt-5">
                <ActionLink
                  href="/transactions/new"
                  icon={<Plus size={18} weight="bold" />}
                  variant="secondary"
                >
                  Tambah manual
                </ActionLink>
              </div>
            </div>
          </div>
        </article>

        <WeeklyInsightCard state={snapshot.weeklyInsightState} />
      </section>

      <section className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-6">
        <article
          aria-labelledby="category-distribution-title"
          className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-level-1 sm:p-7"
        >
          <h2
            className="font-display text-[22px] leading-7 font-semibold text-ink"
            id="category-distribution-title"
          >
            Distribusi kategori
          </h2>
          {largestCategory ? (
            <CategoryExpenseChart
              categories={snapshot.categories}
              periodLabel={snapshot.period.label}
              totalAmountIdr={snapshot.totalAmountIdr}
            />
          ) : (
            <div className="flex min-h-[300px] flex-col justify-center py-8 text-center">
              <h3 className="font-display text-lg font-semibold text-ink">
                Belum ada data kategori.
              </h3>
              <p className="mx-auto mt-2 max-w-[420px] font-body text-sm leading-6 text-ink-secondary">
                Grafik akan terbentuk otomatis dari transaksi pada periode ini.
              </p>
            </div>
          )}
        </article>

        <RecentTransactions
          periodLabel={snapshot.period.label}
          transactionCount={snapshot.transactionCount}
          transactions={snapshot.recentTransactions}
        />
      </section>

      <section
        aria-labelledby="export-title"
        className="mt-7 flex min-w-0 flex-col gap-5 border-t border-divider pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0">
          <h2
            className="font-display text-xl leading-7 font-semibold text-ink"
            id="export-title"
          >
            Export data transaksi
          </h2>
          <p className="mt-1 max-w-[680px] font-body text-sm leading-6 text-ink-secondary">
            Unduh seluruh transaksi milik akunmu. CSV cocok untuk data mentah;
            Excel siap dibuka sebagai lembar kerja.
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap gap-3">
          <ExportLink disabled={!hasTransactions} format="csv" />
          <ExportLink disabled={!hasTransactions} format="xlsx" />
        </div>
      </section>
    </div>
  );
}
