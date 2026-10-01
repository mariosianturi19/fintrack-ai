"use client";

import { Wallet } from "@phosphor-icons/react/Wallet";
import { useRouter } from "next/navigation";

import type { WalletRecord } from "../domain";
import { getWalletOptionLabel } from "../scope-query";

type WalletScopeSelectorProps = Readonly<{
  currentQuery: string;
  pathname: string;
  selectedWalletId: string | null;
  wallets: readonly WalletRecord[];
}>;

export function WalletScopeSelector({
  currentQuery,
  pathname,
  selectedWalletId,
  wallets,
}: WalletScopeSelectorProps) {
  const router = useRouter();

  return (
    <label className="block min-w-0 sm:min-w-[210px]">
      <span className="mb-1.5 flex items-center gap-2 font-body text-xs font-semibold text-ink-secondary">
        <Wallet aria-hidden="true" size={16} weight="bold" />
        Ruang dompet
      </span>
      <select
        aria-label="Pilih ruang dompet"
        className="min-h-12 w-full rounded-md border border-border bg-surface px-3 font-body text-sm font-semibold text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
        onChange={(event) => {
          const query = new URLSearchParams(currentQuery);
          query.delete("page");
          query.delete("status");
          if (event.target.value) query.set("wallet", event.target.value);
          else query.delete("wallet");
          const nextQuery = query.toString();
          router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
        }}
        value={selectedWalletId ?? ""}
      >
        <option value="">Semua dompet</option>
        {wallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {getWalletOptionLabel(wallet)}
          </option>
        ))}
      </select>
    </label>
  );
}
