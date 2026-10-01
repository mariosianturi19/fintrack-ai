import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import {
  WALLET_TYPES,
  type WalletManagementRecord,
  type WalletRecord,
  type WalletType,
} from "./domain";

const walletRowSchema = z.object({
  created_at: z.string(),
  id: z.string().uuid(),
  name: z.string().min(1).max(48),
  updated_at: z.string(),
  wallet_type: z.enum(WALLET_TYPES),
});
const deletionSummaryRowSchema = z.object({
  receipt_count: z.coerce.number().int().min(0),
  transaction_count: z.coerce.number().int().min(0),
  wallet_id: z.string().uuid(),
});
const receiptKeyRowSchema = z.object({ receipt_object_key: z.string() });

export class WalletDataError extends Error {
  constructor(
    public readonly code: "database" | "duplicate_name" | "not_found",
  ) {
    super(code);
    this.name = "WalletDataError";
  }
}

function mapWallet(row: z.infer<typeof walletRowSchema>): WalletRecord {
  return {
    createdAt: row.created_at,
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
    walletType: row.wallet_type,
  };
}

export function parseWallets(data: unknown): readonly WalletRecord[] {
  return z.array(walletRowSchema).parse(data).map(mapWallet);
}

function reportWalletError(context: string, error: unknown) {
  console.error(`[Fintrack AI] ${context}`, {
    code:
      typeof error === "object" && error && "code" in error
        ? error.code
        : undefined,
  });
}

export async function listWallets(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("id, name, wallet_type, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    reportWalletError("Daftar dompet gagal dimuat.", error);
    throw new WalletDataError("database");
  }

  try {
    return parseWallets(data);
  } catch (error) {
    reportWalletError("Respons daftar dompet tidak valid.", error);
    throw new WalletDataError("database");
  }
}

export async function listWalletsWithDeletionSummaries(
  userId: string,
): Promise<readonly WalletManagementRecord[]> {
  const supabase = await createClient();
  const [wallets, summaryResult] = await Promise.all([
    listWallets(userId),
    supabase.rpc("get_wallet_deletion_summaries"),
  ]);

  if (summaryResult.error) {
    reportWalletError(
      "Ringkasan penghapusan dompet gagal dimuat.",
      summaryResult.error,
    );
    throw new WalletDataError("database");
  }

  try {
    const summaries = z
      .array(deletionSummaryRowSchema)
      .parse(summaryResult.data);
    const summaryByWallet = new Map(
      summaries.map((summary) => [summary.wallet_id, summary]),
    );

    return wallets.map((wallet) => {
      const summary = summaryByWallet.get(wallet.id);
      return {
        ...wallet,
        receiptCount: summary?.receipt_count ?? 0,
        transactionCount: summary?.transaction_count ?? 0,
      };
    });
  } catch (error) {
    reportWalletError("Respons ringkasan dompet tidak valid.", error);
    throw new WalletDataError("database");
  }
}

export async function assertOwnedWallet(userId: string, walletId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("id")
    .eq("id", walletId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new WalletDataError("database");
  if (!data) throw new WalletDataError("not_found");
}

export async function createWallet(
  userId: string,
  name: string,
  walletType: WalletType,
) {
  const supabase = await createClient();
  const { error } = await supabase.from("wallets").insert({
    name,
    user_id: userId,
    wallet_type: walletType,
  });

  if (error?.code === "23505") throw new WalletDataError("duplicate_name");
  if (error) throw new WalletDataError("database");
}

export async function updateWallet(
  userId: string,
  walletId: string,
  name: string,
  walletType: WalletType,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wallets")
    .update({ name, wallet_type: walletType })
    .eq("id", walletId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") throw new WalletDataError("duplicate_name");
  if (error) throw new WalletDataError("database");
  if (!data) throw new WalletDataError("not_found");
}

export async function listWalletReceiptObjectKeys(
  userId: string,
  walletId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("receipt_object_key")
    .eq("user_id", userId)
    .eq("wallet_id", walletId)
    .not("receipt_object_key", "is", null);

  if (error) throw new WalletDataError("database");

  try {
    return z
      .array(receiptKeyRowSchema)
      .parse(data)
      .map((row) => row.receipt_object_key);
  } catch (error) {
    reportWalletError("Daftar foto dompet tidak valid.", error);
    throw new WalletDataError("database");
  }
}

export async function deleteWalletWithData(userId: string, walletId: string) {
  await assertOwnedWallet(userId, walletId);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("delete_wallet_with_data", {
    p_wallet_id: walletId,
  });

  if (error?.code === "P0002") throw new WalletDataError("not_found");
  if (error) throw new WalletDataError("database");
  if (!Array.isArray(data) || data.length !== 1) {
    throw new WalletDataError("database");
  }
}
