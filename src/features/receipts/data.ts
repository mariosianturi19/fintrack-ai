import "server-only";

import { createClient } from "@/lib/supabase/server";

import { createReceiptObjectKey } from "./object-key";
import type { ParsedReceiptReviewInput } from "./review-validation";
import {
  deletePendingReceiptUpload,
  deleteStoredReceiptObject,
  promotePendingReceiptUpload,
} from "./storage";

type ReceiptDataErrorCode = "category_unavailable" | "database";

export class ReceiptDataError extends Error {
  constructor(
    public readonly code: ReceiptDataErrorCode,
    options?: ErrorOptions,
  ) {
    super(code, options);
    this.name = "ReceiptDataError";
  }
}

async function findTransactionByReceiptKey(
  userId: string,
  objectKey: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("receipt_object_key", objectKey)
    .maybeSingle();

  if (error) {
    console.error("[Fintrack AI] Pemeriksaan transaksi struk gagal.", {
      code: error.code,
    });
    throw new ReceiptDataError("database", { cause: error });
  }

  return data?.id ?? null;
}

export async function createReviewedReceiptTransaction(
  userId: string,
  input: ParsedReceiptReviewInput,
): Promise<string> {
  const objectKey = createReceiptObjectKey(userId, input.uploadId);
  const existingId = await findTransactionByReceiptKey(userId, objectKey);

  if (existingId) {
    await deletePendingReceiptUpload(userId, input.uploadId).catch(
      () => undefined,
    );
    return existingId;
  }

  const supabase = await createClient();
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("id", input.categoryId)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    console.error("[Fintrack AI] Verifikasi kategori struk gagal.", {
      code: categoryError.code,
    });
    throw new ReceiptDataError("database", { cause: categoryError });
  }

  if (!category) {
    throw new ReceiptDataError("category_unavailable");
  }

  await promotePendingReceiptUpload(userId, input.uploadId);

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      amount_idr: input.amountIdr,
      category_id: input.categoryId,
      merchant: input.merchant,
      notes: input.notes,
      receipt_items: input.items,
      receipt_object_key: objectKey,
      source: "receipt_ai",
      transaction_date: input.transactionDate,
      user_id: userId,
    })
    .select("id")
    .maybeSingle();

  if (error || !data) {
    if (error?.code === "23505") {
      const duplicateId = await findTransactionByReceiptKey(userId, objectKey);

      if (duplicateId) {
        await deletePendingReceiptUpload(userId, input.uploadId).catch(
          () => undefined,
        );
        return duplicateId;
      }
    }

    await deleteStoredReceiptObject(userId, objectKey).catch(() => undefined);
    console.error("[Fintrack AI] Penyimpanan transaksi struk gagal.", {
      code: error?.code,
    });
    throw new ReceiptDataError("database", { cause: error });
  }

  await deletePendingReceiptUpload(userId, input.uploadId).catch(() => {
    console.warn("[Fintrack AI] Foto sementara menunggu lifecycle cleanup.");
  });

  return data.id;
}
