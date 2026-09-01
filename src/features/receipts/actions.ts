"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/session";

import { createReviewedReceiptTransaction, ReceiptDataError } from "./data";
import {
  parseReceiptReviewForm,
  type ReceiptReviewActionState,
} from "./review-validation";
import { ReceiptStorageError } from "./storage";
import { getJakartaDateInputValue } from "../transactions/format";

export async function saveReceiptTransactionAction(
  _previousState: ReceiptReviewActionState,
  formData: FormData,
): Promise<ReceiptReviewActionState> {
  const parsed = parseReceiptReviewForm(formData, getJakartaDateInputValue());

  if (!parsed.success) {
    return parsed.state;
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      fieldErrors: {},
      formError:
        "Sesi kamu tidak lagi valid. Muat ulang halaman lalu masuk kembali.",
      status: "error",
    };
  }

  let transactionId: string;

  try {
    transactionId = await createReviewedReceiptTransaction(userId, parsed.data);
  } catch (error) {
    if (
      error instanceof ReceiptDataError &&
      error.code === "category_unavailable"
    ) {
      return {
        fieldErrors: {
          categoryId: "Kategori ini sudah tidak tersedia. Pilih kategori lain.",
        },
        formError: "Kategori transaksi perlu diperbarui.",
        status: "error",
      };
    }

    const message =
      error instanceof ReceiptStorageError
        ? error.message
        : "Transaksi belum tersimpan. Periksa koneksi lalu coba lagi.";

    return { fieldErrors: {}, formError: message, status: "error" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  redirect(`/transactions/${transactionId}?status=receipt-created`);
}
