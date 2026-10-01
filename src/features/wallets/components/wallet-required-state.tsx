import { Wallet } from "@phosphor-icons/react/dist/ssr/Wallet";

import { ActionLink } from "@/components/ui/action-link";

export function WalletRequiredState({
  description,
}: Readonly<{ description: string }>) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 text-center shadow-level-1 sm:p-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Wallet aria-hidden="true" size={24} />
      </span>
      <h2 className="mt-4 font-display text-xl font-semibold text-ink">
        Buat dompet terlebih dahulu
      </h2>
      <p className="mx-auto mt-2 max-w-lg font-body text-sm leading-6 text-ink-secondary">
        {description}
      </p>
      <div className="mt-5 flex justify-center">
        <ActionLink href="/profile#wallets" icon={<Wallet size={18} />}>
          Kelola dompet
        </ActionLink>
      </div>
    </section>
  );
}
