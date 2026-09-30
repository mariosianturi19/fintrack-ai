import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { Warning } from "@phosphor-icons/react/dist/ssr/Warning";

import { formatIdr } from "@/features/transactions/format";

import { saveCategoryBudgetAction } from "../actions";
import type { BudgetOverview, BudgetStatus } from "../domain";
import { DeleteBudgetDialog } from "./delete-budget-dialog";

const statusCopy: Record<BudgetStatus, string> = {
  exceeded: "Batas terlewati",
  near_limit: "Mendekati batas",
  not_set: "Belum diatur",
  on_track: "Masih sesuai rencana",
};

function BudgetStatusBadge({ status }: Readonly<{ status: BudgetStatus }>) {
  const warning = status === "near_limit" || status === "exceeded";
  const Icon = warning ? Warning : CheckCircle;
  const classes =
    status === "exceeded"
      ? "bg-error-soft text-error"
      : status === "near_limit"
        ? "bg-warning-soft text-warning-ink"
        : status === "on_track"
          ? "bg-signal-soft text-signal-ink"
          : "bg-primary-soft text-primary";

  return (
    <span
      className={`ft-status-badge gap-1.5 rounded-sm font-body text-xs font-semibold ${classes}`}
    >
      <Icon aria-hidden="true" size={15} weight="bold" />
      {statusCopy[status]}
    </span>
  );
}

export function BudgetPlanner({
  overview,
}: Readonly<{ overview: BudgetOverview }>) {
  return (
    <div className="mt-7 min-w-0">
      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overview.categories.map((budget) => (
          <article
            className="min-w-0 rounded-lg border border-border bg-surface p-5 shadow-level-1"
            key={budget.categoryId}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-ink">
                  {budget.category.name}
                </p>
                <p className="mt-1 font-body text-sm text-ink-secondary">
                  {budget.transactionCount} transaksi bulan ini
                </p>
              </div>
              <BudgetStatusBadge status={budget.status} />
            </div>

            <div className="mt-5">
              <div className="flex min-w-0 items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-body text-xs font-semibold tracking-[0.12em] text-ink-secondary uppercase">
                    Terpakai
                  </p>
                  <p className="numeric mt-1 font-display text-2xl font-semibold text-ink">
                    {formatIdr(budget.spentAmountIdr)}
                  </p>
                </div>
                <p className="numeric shrink-0 font-body text-sm font-semibold text-ink-secondary">
                  {budget.limitAmountIdr
                    ? `${budget.percentage}%`
                    : "Tanpa batas"}
                </p>
              </div>
              <div
                aria-label={
                  budget.limitAmountIdr
                    ? `${Math.min(budget.percentage, 100)} persen budget terpakai`
                    : "Budget belum diatur"
                }
                className="mt-3 h-2 overflow-hidden rounded-xs bg-disabled-bg"
                role="progressbar"
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={
                  budget.limitAmountIdr ? Math.min(budget.percentage, 100) : 0
                }
              >
                <span
                  className={`block h-full rounded-xs ${
                    budget.status === "exceeded"
                      ? "bg-error"
                      : budget.status === "near_limit"
                        ? "bg-warning-ink"
                        : "bg-primary"
                  }`}
                  style={{
                    width: `${
                      budget.limitAmountIdr
                        ? Math.min(budget.percentage, 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="mt-2 font-body text-xs leading-5 text-ink-secondary">
                {budget.limitAmountIdr
                  ? `Batas ${formatIdr(budget.limitAmountIdr)}`
                  : "Atur batas agar Fintrack dapat memberi peringatan."}
              </p>
            </div>

            <form action={saveCategoryBudgetAction} className="mt-5">
              <input
                name="categoryId"
                type="hidden"
                value={budget.categoryId}
              />
              <input
                name="monthStart"
                type="hidden"
                value={overview.monthStart}
              />
              <label className="block">
                <span className="font-body text-xs font-semibold text-ink-secondary">
                  Batas pengeluaran
                </span>
                <span className="mt-1.5 flex min-w-0">
                  <span className="flex min-h-12 items-center rounded-l-md border border-r-0 border-border bg-canvas-subtle px-3 font-body text-sm font-semibold text-ink-secondary">
                    Rp
                  </span>
                  <input
                    className="min-h-12 min-w-0 flex-1 rounded-r-md border border-border bg-surface px-3 font-body text-sm text-ink"
                    defaultValue={budget.limitAmountIdr ?? ""}
                    inputMode="numeric"
                    max={999999999999}
                    min={1}
                    name="limitAmountIdr"
                    placeholder="500000"
                    required
                    type="number"
                  />
                </span>
              </label>
              <div className="mt-3 flex min-w-0 flex-wrap gap-2">
                <button
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-primary px-4 font-body text-sm font-semibold text-white hover:bg-primary-hover"
                  type="submit"
                >
                  {budget.limitAmountIdr ? "Perbarui" : "Simpan budget"}
                </button>
              </div>
            </form>

            {budget.limitAmountIdr ? (
              <DeleteBudgetDialog
                categoryId={budget.categoryId}
                categoryName={budget.category.name}
                limitAmountIdr={budget.limitAmountIdr}
                monthLabel={overview.monthLabel}
                monthStart={overview.monthStart}
              />
            ) : null}
          </article>
        ))}
      </section>
    </div>
  );
}
