import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr/ShieldCheck";
import type { Metadata } from "next";

import { signOut } from "@/app/auth/actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getAuthenticatedAccount } from "@/lib/auth/session";
import { DeleteAccountDialog } from "@/features/account-deletion/components/delete-account-dialog";

export const metadata: Metadata = {
  title: "Profil",
};

type ProfilePageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
  }>;
}>;

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const [account, parameters] = await Promise.all([
    getAuthenticatedAccount(),
    searchParams,
  ]);

  if (!account) {
    return null;
  }

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
