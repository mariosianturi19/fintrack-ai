export const WALLET_TYPES = ["bank", "e_wallet", "cash", "other"] as const;

export type WalletType = (typeof WALLET_TYPES)[number];

const walletTypeLabels: Record<WalletType, string> = {
  bank: "Bank",
  cash: "Tunai",
  e_wallet: "E-wallet",
  other: "Lainnya",
};

export function getWalletTypeLabel(walletType: WalletType) {
  return walletTypeLabels[walletType];
}

export type WalletRecord = Readonly<{
  createdAt: string;
  id: string;
  name: string;
  updatedAt: string;
  walletType: WalletType;
}>;

export type WalletManagementRecord = WalletRecord &
  Readonly<{
    receiptCount: number;
    transactionCount: number;
  }>;

export type WalletScope = Readonly<{
  label: string;
  selectedWallet: WalletRecord | null;
  walletId: string | null;
  wallets: readonly WalletRecord[];
}>;

export type WalletActionState = Readonly<{
  fieldError?: string;
  formError?: string;
  status: "idle" | "error";
}>;
