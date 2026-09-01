import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { Receipt } from "@phosphor-icons/react/dist/ssr/Receipt";
import type { Metadata } from "next";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { listActiveCategories } from "@/features/transactions/data";
import { getJakartaDateInputValue } from "@/features/transactions/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tambah transaksi",
};

export default async function NewTransactionPage() {
  const categories = await listActiveCategories();
  const today = getJakartaDateInputValue();

  return (
    <>
      <PageHeader
        action={
          <ActionLink
            href="/transactions"
            icon={<ArrowLeft size={18} weight="bold" />}
            variant="secondary"
          >
            Kembali
          </ActionLink>
        }
        description="Nominal, kategori, tanggal, dan catatan dapat diperiksa sebelum disimpan"
        eyebrow="Input manual"
        title="Tambah transaksi"
      />

      <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,640px)_minmax(280px,0.5fr)] xl:items-start">
        <section className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7">
          <TransactionForm
            categories={categories}
            initialValues={{
              amountIdr: "",
              categoryId: "",
              notes: "",
              transactionDate: today,
            }}
            maximumDate={today}
            mode="create"
          />
        </section>

        <aside className="min-w-0 rounded-xl bg-primary-soft p-5 sm:p-6">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-md bg-surface text-primary"
          >
            <Receipt size={22} weight="regular" />
          </span>
          <h2 className="mt-5 font-display text-xl leading-7 font-semibold text-ink">
            Catat secukupnya.
          </h2>
          <p className="mt-2 font-body text-sm leading-6 text-ink-secondary">
            Catatan bersifat opsional. Gunakan informasi singkat yang
            memudahkanmu mengenali transaksi nanti tanpa memasukkan data pribadi
            yang tidak diperlukan.
          </p>
        </aside>
      </div>
    </>
  );
}
