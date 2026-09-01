import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import {
  getTransactionNoticeStatus,
  TransactionNotice,
} from "@/features/transactions/components/transaction-notice";
import { listTransactionsPage } from "@/features/transactions/data";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transaksi",
};

type TransactionsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function parsePage(value: string | string[] | undefined) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const page = Number(candidate);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const [parameters, userId] = await Promise.all([
    searchParams,
    getAuthenticatedUserId(),
  ]);

  if (!userId) {
    redirect("/login?next=%2Ftransactions");
  }

  const requestedPage = parsePage(parameters.page);
  const page = await listTransactionsPage(userId, requestedPage);

  if (page.total > 0 && requestedPage > page.pageCount) {
    redirect(`/transactions?page=${page.pageCount}`);
  }

  return (
    <>
      <PageHeader
        action={
          <ActionLink
            href="/transactions/new"
            icon={<Plus size={18} weight="bold" />}
          >
            Tambah manual
          </ActionLink>
        }
        description={
          page.total > 0
            ? `${page.total} transaksi tersimpan · terbaru lebih dahulu`
            : "Catat pengeluaran manual dengan data yang dapat kamu koreksi"
        }
        eyebrow="Pengeluaran pribadi"
        title="Transaksi"
      />
      <TransactionNotice
        status={getTransactionNoticeStatus(parameters.status)}
      />
      <div className="mt-6">
        <TransactionList page={page} />
      </div>
    </>
  );
}
