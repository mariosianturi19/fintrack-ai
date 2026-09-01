import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { createStoredReceiptPreviewUrl } from "@/features/receipts/storage";
import { TransactionDetailCard } from "@/features/transactions/components/transaction-detail-card";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import {
  getTransactionNoticeStatus,
  TransactionNotice,
} from "@/features/transactions/components/transaction-notice";
import {
  getTransactionEditorData,
  listTransactionsPage,
  TransactionDataError,
} from "@/features/transactions/data";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit transaksi",
};

type TransactionDetailPageProps = Readonly<{
  params: Promise<{ transactionId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

async function loadTransactionPageData(userId: string, transactionId: string) {
  try {
    const [editorData, contextPage] = await Promise.all([
      getTransactionEditorData(userId, transactionId),
      listTransactionsPage(userId, 1, 7),
    ]);

    return { contextPage, editorData };
  } catch (error) {
    if (error instanceof TransactionDataError && error.code === "not_found") {
      notFound();
    }

    throw error;
  }
}

export default async function TransactionDetailPage({
  params,
  searchParams,
}: TransactionDetailPageProps) {
  const [{ transactionId }, parameters, userId] = await Promise.all([
    params,
    searchParams,
    getAuthenticatedUserId(),
  ]);

  if (!userId) {
    redirect(
      `/login?next=${encodeURIComponent(`/transactions/${transactionId}`)}`,
    );
  }

  const { contextPage, editorData } = await loadTransactionPageData(
    userId,
    transactionId,
  );
  let receiptPreviewUrl: string | null = null;

  if (editorData.transaction.receiptObjectKey) {
    receiptPreviewUrl = await createStoredReceiptPreviewUrl(
      userId,
      editorData.transaction.receiptObjectKey,
    ).catch(() => null);
  }

  return (
    <>
      <PageHeader
        action={
          <ActionLink
            href="/transactions"
            icon={<ArrowLeft size={18} weight="bold" />}
            variant="secondary"
          >
            Semua transaksi
          </ActionLink>
        }
        description="Periksa kembali nominal, tanggal, kategori, dan catatan"
        eyebrow="Koreksi data"
        title="Edit transaksi"
      />
      <TransactionNotice
        status={getTransactionNoticeStatus(parameters.status)}
      />

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)] xl:items-start">
        <div className="hidden min-w-0 xl:block">
          <TransactionList
            page={contextPage}
            selectedTransactionId={transactionId}
            showPagination={false}
          />
        </div>
        <TransactionDetailCard
          categories={editorData.categories}
          receiptPreviewUrl={receiptPreviewUrl}
          transaction={editorData.transaction}
        />
      </div>
    </>
  );
}
