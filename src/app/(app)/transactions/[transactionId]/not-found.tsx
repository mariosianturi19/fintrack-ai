import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ShieldWarning } from "@phosphor-icons/react/dist/ssr/ShieldWarning";

import { ActionLink } from "@/components/ui/action-link";

export default function TransactionNotFound() {
  return (
    <section className="flex min-h-[420px] min-w-0 flex-col items-center justify-center rounded-xl border border-border bg-surface px-5 py-12 text-center shadow-level-1">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary"
      >
        <ShieldWarning size={27} weight="regular" />
      </span>
      <h1 className="mt-5 font-display text-[26px] leading-8 font-semibold text-ink">
        Transaksi tidak tersedia.
      </h1>
      <p className="mt-2 max-w-[520px] font-body text-sm leading-6 text-ink-secondary">
        Transaksi mungkin sudah dihapus atau bukan milik akun yang sedang
        digunakan.
      </p>
      <div className="mt-6">
        <ActionLink
          href="/transactions"
          icon={<ArrowLeft size={18} weight="bold" />}
          variant="secondary"
        >
          Kembali ke transaksi
        </ActionLink>
      </div>
    </section>
  );
}
