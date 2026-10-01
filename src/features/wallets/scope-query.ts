import { getWalletTypeLabel, type WalletRecord } from "./domain";

export function createWalletScopeQuery(
  walletId: string | null,
  parameters?: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(parameters ?? {})) {
    if (key === "wallet" || key === "page" || key === "status") continue;
    const firstValue = Array.isArray(value) ? value[0] : value;
    if (firstValue) query.set(key, firstValue);
  }

  if (walletId) query.set("wallet", walletId);
  return query.toString();
}

export function getWalletOptionLabel(wallet: WalletRecord) {
  return `${getWalletTypeLabel(wallet.walletType)} · ${wallet.name}`;
}
