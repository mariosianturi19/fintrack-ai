import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { getLatestMonthlyInsightState } from "@/features/insights/monthly-data";
import {
  formatIdr,
  formatTransactionDate,
  formatTransactionMonth,
} from "@/features/transactions/format";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Insight bulanan" };

export default async function MonthlyInsightPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login?next=%2Finsights%2Fmonthly");
  const state = await getLatestMonthlyInsightState(userId);
  const insight = state.insight;

  return (
    <>
      <PageHeader
        action={
          <ActionLink
            href="/"
            icon={<ArrowLeft size={18} weight="bold" />}
            variant="secondary"
          >
            Dashboard
          </ActionLink>
        }
        description="Pola pengeluaran dari bulan terakhir yang sudah selesai"
        eyebrow="Ringkasan periode"
        title="Insight bulanan"
      />

      {state.status !== "ready" || !insight ? (
        <section className="mt-7 rounded-lg border border-border bg-surface p-6 shadow-level-1">
          <h2 className="font-display text-[22px] font-semibold text-ink">
            {state.status === "unavailable"
              ? "Insight belum dapat dimuat."
              : "Belum ada bulan lengkap untuk diringkas."}
          </h2>
          <p className="mt-2 font-body text-sm leading-6 text-ink-secondary">
            Transaksi tetap dapat dicatat seperti biasa. Ringkasan akan tersedia
            setelah jadwal harian memproses bulan yang selesai.
          </p>
        </section>
      ) : (
        <div className="mt-7 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
          <article className="min-w-0 rounded-xl border border-border bg-surface p-6 shadow-level-1 sm:p-8">
            <p className="font-body text-xs font-semibold tracking-[0.14em] text-ink-secondary uppercase">
              {formatTransactionMonth(insight.monthStart)}
            </p>
            <h2 className="mt-4 font-display text-[28px] leading-tight font-semibold text-ink">
              Pola pengeluaran bulanan
            </h2>
            <p className="mt-4 max-w-[720px] font-body text-base leading-7 text-ink-secondary">
              {insight.summary}
            </p>
            <dl className="mt-7 grid min-w-0 gap-5 border-t border-divider pt-6 sm:grid-cols-2">
              <div>
                <dt className="font-body text-xs font-semibold text-ink-secondary">
                  Total
                </dt>
                <dd className="numeric mt-1 font-display text-2xl font-semibold text-ink">
                  {formatIdr(insight.totalAmountIdr)}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold text-ink-secondary">
                  Transaksi
                </dt>
                <dd className="numeric mt-1 font-display text-2xl font-semibold text-ink">
                  {insight.transactionCount}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold text-ink-secondary">
                  Kategori utama
                </dt>
                <dd className="mt-1 font-body text-sm font-semibold text-ink">
                  {insight.topCategoryName ?? "Belum tersedia"}
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs font-semibold text-ink-secondary">
                  Hari tertinggi
                </dt>
                <dd className="mt-1 font-body text-sm font-semibold text-ink">
                  {insight.peakSpendingDate && insight.peakSpendingAmountIdr
                    ? `${formatTransactionDate(insight.peakSpendingDate)} · ${formatIdr(insight.peakSpendingAmountIdr)}`
                    : "Belum tersedia"}
                </dd>
              </div>
            </dl>
          </article>

          <aside className="min-w-0 rounded-lg bg-primary-soft p-6 sm:p-7">
            <h2 className="font-display text-xl font-semibold text-ink">
              Distribusi kategori
            </h2>
            <ol className="mt-5 space-y-4">
              {insight.categoryTotals.map((category) => (
                <li
                  className="flex min-w-0 justify-between gap-4 border-b border-primary/20 pb-3"
                  key={category.name}
                >
                  <span className="min-w-0 font-body text-sm text-ink-secondary">
                    {category.name}
                  </span>
                  <span className="numeric shrink-0 font-body text-sm font-semibold text-ink">
                    {formatIdr(category.amountIdr)}
                  </span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      )}
    </>
  );
}
