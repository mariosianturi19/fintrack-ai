"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAuthenticatedUserId } from "@/lib/auth/session";
import {
  deleteStoredReceiptObject,
  ReceiptStorageError,
} from "@/features/receipts/storage";

import {
  createManualTransaction,
  deleteOwnedTransaction,
  getOwnedReceiptObjectKey,
  TransactionDataError,
  updateOwnedTransaction,
} from "./data";
import type { TransactionActionState } from "./domain";
import {
  getTransactionFormValues,
  parseTransactionForm,
  transactionIdSchema,
} from "./validation";

function createSessionError(
  state: TransactionActionState,
): TransactionActionState {
  return {
    ...state,
    formError:
      "Sesi kamu tidak lagi valid. Muat ulang halaman lalu masuk kembali.",
    status: "error",
  };
}

function createMutationError(
  error: unknown,
  state: TransactionActionState,
): TransactionActionState {
  if (error instanceof TransactionDataError) {
    if (error.code === "category_unavailable") {
      return {
        ...state,
        fieldErrors: {
          ...state.fieldErrors,
          categoryId: "Kategori ini sudah tidak tersedia. Pilih kategori lain.",
        },
        formError: "Kategori transaksi perlu diperbarui.",
        status: "error",
      };
    }

    if (error.code === "not_found") {
      return {
        ...state,
        formError:
          "Transaksi tidak ditemukan atau tidak dapat diakses oleh akun ini.",
        status: "error",
      };
    }
  }

  if (error instanceof ReceiptStorageError) {
    return {
      ...state,
      formError: error.message,
      status: "error",
    };
  }

  console.error("[Fintrack AI] Mutasi transaksi gagal.", error);

  return {
    ...state,
    formError:
      "Perubahan belum tersimpan. Periksa koneksi lalu coba sekali lagi.",
    status: "error",
  };
}

export async function createTransactionAction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = parseTransactionForm(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  const userId = await getAuthenticatedUserId();
  const fallbackState: TransactionActionState = {
    fieldErrors: {},
    status: "idle",
    values: parsed.values,
  };

  if (!userId) {
    return createSessionError(fallbackState);
  }

  try {
    await createManualTransaction(userId, parsed.data);
  } catch (error) {
    return createMutationError(error, fallbackState);
  }

  revalidatePath("/transactions");
  redirect("/transactions?status=created");
}

export async function updateTransactionAction(
  transactionId: string,
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsedId = transactionIdSchema.safeParse(transactionId);
  const parsed = parseTransactionForm(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  const fallbackState: TransactionActionState = {
    fieldErrors: {},
    status: "idle",
    values: parsed.values,
  };

  if (!parsedId.success) {
    return {
      ...fallbackState,
      formError: "Identitas transaksi tidak valid.",
      status: "error",
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createSessionError(fallbackState);
  }

  try {
    await updateOwnedTransaction(userId, parsedId.data, parsed.data);
  } catch (error) {
    return createMutationError(error, fallbackState);
  }

  revalidatePath("/transactions");
  revalidatePath(`/transactions/${parsedId.data}`);
  redirect(`/transactions/${parsedId.data}?status=updated`);
}

export async function deleteTransactionAction(
  transactionId: string,
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsedId = transactionIdSchema.safeParse(transactionId);
  const fallbackState: TransactionActionState = {
    fieldErrors: {},
    status: "idle",
    values: getTransactionFormValues(formData),
  };

  if (!parsedId.success) {
    return {
      ...fallbackState,
      formError: "Identitas transaksi tidak valid.",
      status: "error",
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createSessionError(fallbackState);
  }

  try {
    const receiptObjectKey = await getOwnedReceiptObjectKey(
      userId,
      parsedId.data,
    );

    if (receiptObjectKey) {
      await deleteStoredReceiptObject(userId, receiptObjectKey);
    }

    await deleteOwnedTransaction(userId, parsedId.data);
  } catch (error) {
    return createMutationError(error, fallbackState);
  }

  revalidatePath("/transactions");
  redirect("/transactions?status=deleted");
}
