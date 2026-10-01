import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import type { Metadata } from "next";

import { signOut } from "@/app/auth/actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAuthenticatedAccount,
  getAuthenticatedUserId,
} from "@/lib/auth/session";
import { DeleteAccountDialog } from "@/features/account-deletion/components/delete-account-dialog";
import { WalletManager } from "@/features/wallets/components/wallet-manager";
import { listWalletsWithDeletionSummaries } from "@/features/wallets/data";

export const metadata: Metadata = {
  title: "Profil",
};

type ProfilePageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    walletStatus?: string;
  }>;
}>;

const walletNotices: Record<
  string,
  { message: string; tone: "error" | "success" }
> = {
  created: { message: "Dompet baru siap digunakan.", tone: "success" },
  deleted: {
    message: "Dompet dan seluruh data terkait berhasil dihapus permanen.",
    tone: "success",
  },
  duplicate: {
    message: "Nama dompet sudah digunakan. Pilih nama lain.",
    tone: "error",
  },
  error: {
    message: "Perubahan dompet belum tersimpan. Coba lagi.",
    tone: "error",
  },
  invalid: {
    message: "Data dompet belum valid. Periksa nama dan jenis lalu coba lagi.",
    tone: "error",
  },
  renamed: { message: "Nama dan jenis dompet diperbarui.", tone: "success" },
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [account, parameters, userId] = await Promise.all([
    getAuthenticatedAccount(),
    searchParams,
    getAuthenticatedUserId(),
  ]);

  if (!account || !userId) {
    return null;
  }
  const wallets = await listWalletsWithDeletionSummaries(userId);
  const walletNotice = parameters.walletStatus
    ? walletNotices[parameters.walletStatus]
    : undefined;

  return (
    <>
      <PageHeader
        description="Akun, export data, dan kontrol privasi"
        eyebrow="Ruang kerja"
        title="Profil"
      />

      {parameters.error === "signout_failed" ? (
        <div
          className="mt-6 rounded-md border border-error bg-error-soft p-4"
          role="alert"
        >
          <p className="font-body text-sm font-semibold text-error">
            Belum berhasil keluar
          </p>
          <p className="mt-1 font-body text-sm leading-6 text-ink-secondary">
            Sesi masih aktif. Periksa koneksi lalu coba lagi.
          </p>
        </div>
      ) : null}

      {walletNotice ? (
        <p
          className={`mt-6 rounded-md border p-4 font-body text-sm ${
            walletNotice.tone === "error"
              ? "border-error bg-error-soft text-error"
              : "border-signal bg-signal-soft text-signal-ink"
          }`}
          role={walletNotice.tone === "error" ? "alert" : "status"}
        >
          {walletNotice.message}
        </p>
      ) : null}

      <section className="mt-7 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.42fr)] lg:gap-6">
        <article className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7">
          <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-body text-sm font-semibold text-white"
            >
              {account.initials}
            </span>
            <div className="min-w-0 flex-1">
              <StatusBadge
                icon={<CheckCircle size={16} weight="bold" />}
                tone="success"
              >
                Terhubung melalui Google
              </StatusBadge>
              <h2 className="mt-4 font-display text-[24px] leading-[1.25] font-semibold tracking-[-0.015em] text-ink">
                {account.displayName}
              </h2>
              <p className="mt-1 break-all font-body text-sm leading-6 text-ink-secondary">
                {account.email}
              </p>

              <form action={signOut} className="mt-7">
                <SignOutButton />
              </form>
            </div>
          </div>
        </article>

        <aside className="min-w-0 rounded-lg border border-border bg-canvas-subtle p-5 sm:p-6">
          <ShieldCheck aria-hidden="true" className="text-primary" size={24} />
          <h2 className="mt-4 font-display text-xl leading-7 font-semibold text-ink">
            Simpan salinan datamu
          </h2>
          <p className="mt-2 font-body text-sm leading-6 text-ink-secondary">
            Unduh seluruh transaksi sebelum menghapus akun jika kamu ingin
            menyimpan riwayat pengeluaran. Foto struk tidak disertakan dalam
            export.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-primary px-4 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
              href="/api/exports/transactions?format=csv"
            >
              Export CSV
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-primary px-4 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
              href="/api/exports/transactions?format=xlsx"
            >
              Export Excel
            </a>
          </div>
        </aside>
      </section>
      <WalletManager wallets={wallets} />
      <section
        aria-labelledby="account-deletion-heading"
        className="mt-8 min-w-0 rounded-lg border border-error bg-surface p-5 sm:p-7"
      >
        <h2
          className="font-display text-xl font-semibold text-ink"
          id="account-deletion-heading"
        >
          Hapus akun Fintrack AI
        </h2>
        <p className="mt-3 max-w-[720px] font-body text-sm leading-6 text-ink-secondary">
          Hapus akun, transaksi, insight, dan seluruh foto struk terkait.
          Tindakan ini berbeda dari keluar akun dan tidak dapat dibatalkan. Akun
          Google kamu tetap ada.
        </p>
        <div className="mt-5">
          <DeleteAccountDialog email={account.email} />
        </div>
      </section>
    </>
  );
}
