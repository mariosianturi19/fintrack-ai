import "server-only";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import {
  assertOwnedWallet,
  parseWallets,
  WalletDataError,
} from "@/features/wallets/data";
import type { WalletRecord } from "@/features/wallets/domain";

import type { ParsedTransactionInput } from "./validation";
import type {
  TransactionCategory,
  TransactionEditorData,
  TransactionFilters,
  TransactionPage,
  TransactionReceiptItem,
  TransactionRecord,
} from "./domain";
import { escapeLikePattern } from "./filters";

const defaultPageSize = 20;
const exportBatchSize = 1_000;
const exportMaxRows = 50_000;

const categoryRowSchema = z.object({
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  id: z.string().uuid(),
  is_active: z.boolean(),
  name: z.string(),
  slug: z.string(),
  sort_order: z.number().int(),
});

const transactionRowSchema = z.object({
  amount_idr: z.coerce.number().int().positive().max(999_999_999_999),
  category_id: z.string().uuid(),
  created_at: z.string(),
  id: z.string().uuid(),
  merchant: z.string().nullable(),
  notes: z.string().nullable(),
  receipt_items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string().nullable(),
        totalPriceIdr: z.number().int().positive().nullable(),
        unitPriceIdr: z.number().int().positive().nullable(),
      }),
    )
    .nullable()
    .optional(),
  receipt_object_key: z.string().nullable().optional(),
  source: z.enum(["manual", "receipt_ai"]),
  transaction_date: z.string(),
  updated_at: z.string(),
  wallet_id: z.string().uuid(),
});

type TransactionDataErrorCode =
  | "category_unavailable"
  | "database"
  | "export_limit"
  | "not_found"
  | "wallet_unavailable";

export class TransactionDataError extends Error {
  readonly code: TransactionDataErrorCode;

  constructor(code: TransactionDataErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = "TransactionDataError";
    this.code = code;
  }
}

function mapCategory(
  row: z.infer<typeof categoryRowSchema>,
): TransactionCategory {
  return {
    colorHex: row.color_hex,
    id: row.id,
    isActive: row.is_active,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

function mapTransaction(
  row: z.infer<typeof transactionRowSchema>,
  category: TransactionCategory,
  wallet: WalletRecord,
): TransactionRecord {
  return {
    amountIdr: row.amount_idr,
    category,
    categoryId: row.category_id,
    createdAt: row.created_at,
    id: row.id,
    merchant: row.merchant,
    notes: row.notes,
    receiptItems: (row.receipt_items ??
      []) satisfies readonly TransactionReceiptItem[],
    receiptObjectKey: row.receipt_object_key ?? null,
    source: row.source,
    transactionDate: row.transaction_date,
    updatedAt: row.updated_at,
    wallet,
    walletId: row.wallet_id,
  };
}

export function parseCategories(data: unknown) {
  return z.array(categoryRowSchema).parse(data).map(mapCategory);
}

export function parseTransactions(
  data: unknown,
  categories: readonly TransactionCategory[],
  wallets: readonly WalletRecord[],
) {
  const categoriesById = new Map(
    categories.map((category) => [category.id, category]),
  );
  const walletsById = new Map(wallets.map((wallet) => [wallet.id, wallet]));

  return z
    .array(transactionRowSchema)
    .parse(data)
    .map((row) => {
      const category = categoriesById.get(row.category_id);
      const wallet = walletsById.get(row.wallet_id);

      if (!category || !wallet) {
        throw new TransactionDataError("database");
      }

      return mapTransaction(row, category, wallet);
    });
}

function reportDatabaseError(context: string, error: unknown) {
  console.error(`[Fintrack AI] ${context}`, error);
}

export async function listActiveCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, color_hex, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    reportDatabaseError("Gagal memuat kategori aktif.", error);
    throw new TransactionDataError("database", { cause: error });
  }

  return parseCategories(data);
}

export async function listTransactionsPage(
  userId: string,
  requestedPage: number,
  pageSize = defaultPageSize,
  filters: TransactionFilters = {
    categoryId: null,
    endDate: null,
    search: "",
    startDate: null,
    walletId: null,
  },
): Promise<TransactionPage> {
  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClient();

  let transactionQuery = supabase
    .from("transactions")
    .select(
      "id, category_id, wallet_id, amount_idr, transaction_date, merchant, notes, source, created_at, updated_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.categoryId) {
    transactionQuery = transactionQuery.eq("category_id", filters.categoryId);
  }
  if (filters.walletId) {
    transactionQuery = transactionQuery.eq("wallet_id", filters.walletId);
  }
  if (filters.startDate) {
    transactionQuery = transactionQuery.gte(
      "transaction_date",
      filters.startDate,
    );
  }
  if (filters.endDate) {
    transactionQuery = transactionQuery.lte(
      "transaction_date",
      filters.endDate,
    );
  }
  if (filters.search) {
    transactionQuery = transactionQuery.ilike(
      "search_text",
      `%${escapeLikePattern(filters.search)}%`,
    );
  }

  const [transactionResult, categoryResult, walletResult] = await Promise.all([
    transactionQuery,
    supabase
      .from("categories")
      .select("id, slug, name, color_hex, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("wallets")
      .select("id, name, wallet_type, created_at, updated_at")
      .eq("user_id", userId),
  ]);

  if (transactionResult.error || categoryResult.error || walletResult.error) {
    reportDatabaseError(
      "Gagal memuat daftar transaksi.",
      transactionResult.error ?? categoryResult.error ?? walletResult.error,
    );
    throw new TransactionDataError("database", {
      cause:
        transactionResult.error ?? categoryResult.error ?? walletResult.error,
    });
  }

  try {
    const categories = parseCategories(categoryResult.data);
    const wallets = parseWallets(walletResult.data);
    const transactions = parseTransactions(
      transactionResult.data,
      categories,
      wallets,
    );
    const total = transactionResult.count ?? 0;

    return {
      currentPage,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
      pageSize,
      total,
      transactions,
    };
  } catch (error) {
    reportDatabaseError("Respons daftar transaksi tidak valid.", error);
    throw new TransactionDataError("database", { cause: error });
  }
}

export async function listOwnedTransactionsForExport(userId: string) {
  const supabase = await createClient();
  const [categoryResult, firstTransactionResult, walletResult] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, slug, name, color_hex, sort_order, is_active")
        .order("sort_order", { ascending: true }),
      supabase
        .from("transactions")
        .select(
          "id, category_id, wallet_id, amount_idr, transaction_date, merchant, notes, source, created_at, updated_at",
          { count: "exact" },
        )
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(0, exportBatchSize - 1),
      supabase
        .from("wallets")
        .select("id, name, wallet_type, created_at, updated_at")
        .eq("user_id", userId),
    ]);

  if (
    categoryResult.error ||
    firstTransactionResult.error ||
    walletResult.error
  ) {
    reportDatabaseError(
      "Gagal menyiapkan data export transaksi.",
      categoryResult.error ??
        firstTransactionResult.error ??
        walletResult.error,
    );
    throw new TransactionDataError("database", {
      cause:
        categoryResult.error ??
        firstTransactionResult.error ??
        walletResult.error,
    });
  }

  const total = firstTransactionResult.count;

  if (total === null) {
    reportDatabaseError(
      "Jumlah data export transaksi tidak tersedia.",
      new Error("Missing exact count"),
    );
    throw new TransactionDataError("database");
  }

  if (total > exportMaxRows) {
    throw new TransactionDataError("export_limit");
  }

  const rows = [...(firstTransactionResult.data ?? [])];

  for (let from = exportBatchSize; from < total; from += exportBatchSize) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, category_id, wallet_id, amount_idr, transaction_date, merchant, notes, source, created_at, updated_at",
      )
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .range(from, Math.min(from + exportBatchSize - 1, total - 1));

    if (error) {
      reportDatabaseError("Gagal melanjutkan data export transaksi.", error);
      throw new TransactionDataError("database", { cause: error });
    }

    rows.push(...(data ?? []));
  }

  try {
    const categories = parseCategories(categoryResult.data);
    const wallets = parseWallets(walletResult.data);

    return parseTransactions(rows, categories, wallets);
  } catch (error) {
    reportDatabaseError("Respons data export transaksi tidak valid.", error);
    throw new TransactionDataError("database", { cause: error });
  }
}

export async function getTransactionEditorData(
  userId: string,
  transactionId: string,
): Promise<TransactionEditorData> {
  const supabase = await createClient();
  const [transactionResult, categoryResult, walletResult] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, category_id, wallet_id, amount_idr, transaction_date, merchant, notes, source, receipt_object_key, receipt_items, created_at, updated_at",
      )
      .eq("id", transactionId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, slug, name, color_hex, sort_order, is_active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("wallets")
      .select("id, name, wallet_type, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (transactionResult.error || categoryResult.error || walletResult.error) {
    reportDatabaseError(
      "Gagal memuat detail transaksi.",
      transactionResult.error ?? categoryResult.error ?? walletResult.error,
    );
    throw new TransactionDataError("database", {
      cause:
        transactionResult.error ?? categoryResult.error ?? walletResult.error,
    });
  }

  if (!transactionResult.data) {
    throw new TransactionDataError("not_found");
  }

  try {
    const categories = parseCategories(categoryResult.data);
    const wallets = parseWallets(walletResult.data);
    const [transaction] = parseTransactions(
      [transactionResult.data],
      categories,
      wallets,
    );
    const selectableCategories = categories.filter(
      (category) => category.isActive || category.id === transaction.categoryId,
    );

    return {
      categories: selectableCategories,
      transaction,
      wallets,
    };
  } catch (error) {
    reportDatabaseError("Respons detail transaksi tidak valid.", error);
    throw new TransactionDataError("database", { cause: error });
  }
}

async function assertCategoryAvailable(
  categoryId: string,
  currentCategoryId?: string,
) {
  if (categoryId === currentCategoryId) {
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    reportDatabaseError("Gagal memverifikasi kategori.", error);
    throw new TransactionDataError("database", { cause: error });
  }

  if (!data) {
    throw new TransactionDataError("category_unavailable");
  }
}

export async function createManualTransaction(
  userId: string,
  input: ParsedTransactionInput,
) {
  await assertCategoryAvailable(input.categoryId);
  try {
    await assertOwnedWallet(userId, input.walletId);
  } catch (error) {
    if (error instanceof WalletDataError && error.code === "not_found") {
      throw new TransactionDataError("wallet_unavailable");
    }
    throw error;
  }
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert({
    amount_idr: input.amountIdr,
    category_id: input.categoryId,
    notes: input.notes,
    source: "manual",
    transaction_date: input.transactionDate,
    user_id: userId,
    wallet_id: input.walletId,
  });

  if (error) {
    reportDatabaseError("Gagal membuat transaksi manual.", error);
    throw new TransactionDataError("database", { cause: error });
  }
}

export async function updateOwnedTransaction(
  userId: string,
  transactionId: string,
  input: ParsedTransactionInput,
) {
  const supabase = await createClient();
  const { data: currentTransaction, error: currentError } = await supabase
    .from("transactions")
    .select("id, category_id, wallet_id")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (currentError) {
    reportDatabaseError(
      "Gagal memverifikasi transaksi untuk edit.",
      currentError,
    );
    throw new TransactionDataError("database", { cause: currentError });
  }

  if (!currentTransaction) {
    throw new TransactionDataError("not_found");
  }

  await assertCategoryAvailable(
    input.categoryId,
    currentTransaction.category_id,
  );
  if (input.walletId !== currentTransaction.wallet_id) {
    try {
      await assertOwnedWallet(userId, input.walletId);
    } catch (error) {
      if (error instanceof WalletDataError && error.code === "not_found") {
        throw new TransactionDataError("wallet_unavailable");
      }
      throw error;
    }
  }

  const { data, error } = await supabase
    .from("transactions")
    .update({
      amount_idr: input.amountIdr,
      category_id: input.categoryId,
      notes: input.notes,
      transaction_date: input.transactionDate,
      wallet_id: input.walletId,
    })
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    reportDatabaseError("Gagal memperbarui transaksi.", error);
    throw new TransactionDataError("database", { cause: error });
  }

  if (!data) {
    throw new TransactionDataError("not_found");
  }
}

export async function deleteOwnedTransaction(
  userId: string,
  transactionId: string,
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    reportDatabaseError("Gagal menghapus transaksi.", error);
    throw new TransactionDataError("database", { cause: error });
  }

  if (!data) {
    throw new TransactionDataError("not_found");
  }
}

export async function getOwnedReceiptObjectKey(
  userId: string,
  transactionId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("receipt_object_key")
    .eq("id", transactionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    reportDatabaseError("Gagal memeriksa foto struk transaksi.", error);
    throw new TransactionDataError("database", { cause: error });
  }

  if (!data) {
    throw new TransactionDataError("not_found");
  }

  return data.receipt_object_key;
}
