import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { TransactionList } from "@/features/transactions/components/transaction-list";
import { TransactionFilters } from "@/features/transactions/components/transaction-filters";
import {
  getTransactionNoticeStatus,
  TransactionNotice,
} from "@/features/transactions/components/transaction-notice";
import {
  listActiveCategories,
  listTransactionsPage,
} from "@/features/transactions/data";
import {
  createTransactionListQuery,
  hasTransactionFilters,
  parseTransactionFilters,
} from "@/features/transactions/filters";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { WalletScopeSelector } from "@/features/wallets/components/wallet-scope-selector";
import { listWallets } from "@/features/wallets/data";
import { resolveWalletScope } from "@/features/wallets/scope";
import { createWalletScopeQuery } from "@/features/wallets/scope-query";
import { parseRequestedWalletId } from "@/features/wallets/validation";

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
  const parsedFilters = parseTransactionFilters(parameters);
  const wallets = await listWallets(userId);
  const scope = resolveWalletScope(
    wallets,
    parseRequestedWalletId(parameters.wallet),
  );
  const filters = { ...parsedFilters, walletId: scope.walletId };
  const [page, categories] = await Promise.all([
    listTransactionsPage(userId, requestedPage, undefined, filters),
    listActiveCategories(),
  ]);
  const filtered = hasTransactionFilters(filters);
  const paginationQuery = createTransactionListQuery(filters);

  if (page.total > 0 && requestedPage > page.pageCount) {
    const query = createTransactionListQuery(filters, page.pageCount);
    redirect(query ? `/transactions?${query}` : "/transactions");
  }

  return (
    <>
      <PageHeader
        action={
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <WalletScopeSelector
              currentQuery={createWalletScopeQuery(scope.walletId, parameters)}
              pathname="/transactions"
              selectedWalletId={scope.walletId}
              wallets={wallets}
            />
            <ActionLink
              href={
                scope.walletId
                  ? `/transactions/new?wallet=${scope.walletId}`
                  : "/transactions/new"
              }
              icon={<Plus size={18} weight="bold" />}
            >
              Tambah manual
            </ActionLink>
          </div>
        }
        description={
          page.total > 0
            ? filtered
              ? `${page.total} transaksi cocok · ${scope.label}`
              : `${page.total} transaksi tersimpan · ${scope.label}`
            : "Catat pengeluaran manual dengan data yang dapat kamu koreksi"
        }
        eyebrow="Pengeluaran pribadi"
        title="Transaksi"
      />
      <TransactionNotice
        status={getTransactionNoticeStatus(parameters.status)}
      />
      <TransactionFilters categories={categories} filters={filters} />
      <div className="mt-6">
        <TransactionList
          filtersActive={filtered}
          page={page}
          paginationQuery={paginationQuery}
        />
      </div>
    </>
  );
}
