import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { BudgetPlanner } from "@/features/budgets/components/budget-planner";
import { getBudgetOverview } from "@/features/budgets/data";
import { formatIdr } from "@/features/transactions/format";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Budget" };

type BudgetPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

const notices: Record<string, string> = {
  deleted: "Budget kategori dihapus.",
  error: "Budget belum dapat diubah. Periksa koneksi lalu coba lagi.",
  invalid: "Nominal budget belum valid. Masukkan angka rupiah lebih dari nol.",
  saved: "Budget kategori tersimpan.",
};

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const [userId, parameters] = await Promise.all([
    getAuthenticatedUserId(),
    searchParams,
  ]);
  if (!userId) redirect("/login?next=%2Fbudgets");

  const overview = await getBudgetOverview(userId);
  const rawStatus = parameters.status;
  const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;

  return (
    <>
      <PageHeader
        description={`Atur batas pengeluaran per kategori untuk ${overview.monthLabel}`}
        eyebrow="Rencana bulanan"
        title="Budget"
      />

      {status && notices[status] ? (
        <p
          className={`mt-5 rounded-md border p-4 font-body text-sm ${
            status === "error" || status === "invalid"
              ? "border-error bg-error-soft text-error"
              : "border-signal bg-signal-soft text-signal-ink"
          }`}
          role={status === "error" || status === "invalid" ? "alert" : "status"}
        >
          {notices[status]}
        </p>
      ) : null}

      <section className="mt-7 grid min-w-0 gap-4 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-ink-secondary uppercase">
            Total budget
          </p>
          <p className="numeric mt-2 font-display text-2xl font-semibold text-ink">
            {formatIdr(overview.totalBudgetAmountIdr)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold tracking-[0.12em] text-ink-secondary uppercase">
            Terpakai bulan ini
          </p>
          <p className="numeric mt-2 font-display text-2xl font-semibold text-ink">
            {formatIdr(overview.totalSpentAmountIdr)}
          </p>
        </div>
        <div className="flex min-w-0 items-start gap-3 sm:col-span-2 lg:col-span-1">
          <CalendarBlank
            aria-hidden="true"
            className="mt-0.5 text-primary"
            size={23}
          />
          <p className="font-body text-sm leading-6 text-ink-secondary">
            Peringatan muncul mulai 80% dan berubah menjadi terlewati saat
            mencapai 100%.
          </p>
        </div>
      </section>

      <BudgetPlanner overview={overview} />
    </>
  );
}
