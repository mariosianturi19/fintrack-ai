import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { Scan } from "@phosphor-icons/react/dist/ssr/Scan";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr/WarningCircle";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ActionLink } from "@/components/ui/action-link";
import { PageHeader } from "@/components/ui/page-header";
import { createDashboardPeriod } from "@/features/dashboard/aggregate";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import {
  DashboardDataError,
  getDashboardSnapshot,
} from "@/features/dashboard/data";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { WalletScopeSelector } from "@/features/wallets/components/wallet-scope-selector";
import { listWallets } from "@/features/wallets/data";
import { resolveWalletScope } from "@/features/wallets/scope";
import { createWalletScopeQuery } from "@/features/wallets/scope-query";
import { parseRequestedWalletId } from "@/features/wallets/validation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

function DashboardErrorState({ dataLimit }: Readonly<{ dataLimit: boolean }>) {
  return (
    <section
      aria-labelledby="dashboard-error-title"
      className="mt-7 rounded-lg border border-error bg-error-soft p-5 sm:p-7"
      role="alert"
    >
      <WarningCircle
        aria-hidden="true"
        className="text-error"
        size={28}
        weight="regular"
      />
      <h2
        className="mt-4 font-display text-[22px] leading-7 font-semibold text-ink"
        id="dashboard-error-title"
      >
        {dataLimit
          ? "Ringkasan periode terlalu besar."
          : "Dashboard belum berhasil dimuat."}
      </h2>
      <p className="mt-2 max-w-[640px] font-body text-sm leading-6 text-ink-secondary">
        {dataLimit
          ? "Batas aman pemrosesan dashboard tercapai. Daftar transaksi tetap dapat dibuka tanpa kehilangan data."
          : "Data tetap aman. Periksa koneksi lalu coba muat ulang, atau buka daftar transaksi untuk melanjutkan pencatatan."}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ActionLink href="/" icon={<ArrowClockwise size={18} weight="bold" />}>
          Coba lagi
        </ActionLink>
        <ActionLink href="/transactions" variant="secondary">
          Buka transaksi
        </ActionLink>
      </div>
    </section>
  );
}

async function DashboardContent({
  scopeLabel,
  userId,
  walletId,
}: Readonly<{
  scopeLabel: string;
  userId: string;
  walletId: string | null;
}>) {
  let snapshot;

  try {
    snapshot = await getDashboardSnapshot(userId, new Date(), walletId);
  } catch (error) {
    return (
      <DashboardErrorState
        dataLimit={
          error instanceof DashboardDataError && error.code === "data_limit"
        }
      />
    );
  }

  return (
    <DashboardView
      scopeLabel={scopeLabel}
      snapshot={snapshot}
      walletId={walletId}
    />
  );
}

type DashboardPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [userId, parameters] = await Promise.all([
    getAuthenticatedUserId(),
    searchParams,
  ]);
  if (!userId) redirect("/login?next=%2F");
  const wallets = await listWallets(userId);
  const scope = resolveWalletScope(
    wallets,
    parseRequestedWalletId(parameters.wallet),
  );
  const period = createDashboardPeriod();

  return (
    <>
      <PageHeader
        action={
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
            <WalletScopeSelector
              currentQuery={createWalletScopeQuery(scope.walletId, parameters)}
              pathname="/"
              selectedWalletId={scope.walletId}
              wallets={wallets}
            />
            <ActionLink
              href={scope.walletId ? `/scan?wallet=${scope.walletId}` : "/scan"}
              icon={<Scan size={19} weight="bold" />}
            >
              Scan struk
            </ActionLink>
          </div>
        }
        description={`Ringkasan ${scope.label.toLocaleLowerCase("id-ID")} · ${period.label}`}
        eyebrow="Periode aktif"
        title="Dashboard"
      />
      <Suspense fallback={<DashboardSkeleton />} key={scope.walletId ?? "all"}>
        <DashboardContent
          scopeLabel={scope.label}
          userId={userId}
          walletId={scope.walletId}
        />
      </Suspense>
    </>
  );
}
