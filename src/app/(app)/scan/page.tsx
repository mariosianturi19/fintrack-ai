import { Info } from "@phosphor-icons/react/dist/ssr/Info";
import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/page-header";
import { ReceiptUploadFlow } from "@/features/receipts/components/receipt-upload-flow";
import { listActiveCategories } from "@/features/transactions/data";
import { getJakartaDateInputValue } from "@/features/transactions/format";
import { listWallets } from "@/features/wallets/data";
import { WalletRequiredState } from "@/features/wallets/components/wallet-required-state";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Scan struk",
};

export default async function ScanPage() {
  const [categories, userId] = await Promise.all([
    listActiveCategories(),
    getAuthenticatedUserId(),
  ]);
  if (!userId) redirect("/login?next=%2Fscan");
  const wallets = await listWallets(userId);

  return (
    <>
      <PageHeader
        description="Siapkan foto struk untuk disimpan secara privat dan tetap dapat kamu tinjau."
        eyebrow="Pengeluaran pribadi"
        title="Scan struk"
      />

      {wallets.length === 0 ? (
        <div className="mt-6 lg:mt-7">
          <WalletRequiredState description="Hasil scan harus disimpan ke salah satu sumber pembayaran. Buat dompet sebelum mengunggah struk." />
        </div>
      ) : (
        <div className="mt-6 lg:mt-7">
          <ReceiptUploadFlow
            categories={categories}
            maximumDate={getJakartaDateInputValue()}
            wallets={wallets}
          />
        </div>
      )}

      <aside className="mt-5 flex min-w-0 items-start gap-3 rounded-lg border border-primary bg-primary-soft p-4 text-primary sm:p-5">
        <Info aria-hidden="true" className="mt-0.5 shrink-0" size={20} />
        <div className="min-w-0">
          <h2 className="font-body text-sm font-semibold">Tips privasi</h2>
          <p className="mt-1 font-body text-sm leading-6 text-ink-secondary">
            Pastikan struk tidak menampilkan nomor kartu lengkap sebelum upload.
          </p>
        </div>
      </aside>
    </>
  );
}
