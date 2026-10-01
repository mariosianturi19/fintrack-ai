import type { WalletRecord, WalletScope } from "./domain";

export function resolveWalletScope(
  wallets: readonly WalletRecord[],
  requestedWalletId: string | null,
): WalletScope {
  const selectedWallet =
    wallets.find((wallet) => wallet.id === requestedWalletId) ?? null;

  return {
    label: selectedWallet ? selectedWallet.name : "Semua dompet",
    selectedWallet,
    walletId: selectedWallet?.id ?? null,
    wallets,
  };
}
