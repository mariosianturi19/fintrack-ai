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

async function DashboardContent() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login?next=%2F");
  }

  let snapshot;

  try {
    snapshot = await getDashboardSnapshot(userId);
  } catch (error) {
    return (
      <DashboardErrorState
        dataLimit={
          error instanceof DashboardDataError && error.code === "data_limit"
        }
      />
    );
  }

  return <DashboardView snapshot={snapshot} />;
}

export default function DashboardPage() {
  const period = createDashboardPeriod();

  return (
    <>
      <PageHeader
        action={
          <ActionLink href="/scan" icon={<Scan size={19} weight="bold" />}>
            Scan struk
          </ActionLink>
        }
        description={`Ringkasan pengeluaran pribadi · ${period.label}`}
        eyebrow="Periode aktif"
        title="Dashboard"
      />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}
