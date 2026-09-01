import { z } from "zod";

import type {
  TransactionActionState,
  TransactionField,
  TransactionFormValues,
} from "./domain";
import { getJakartaDateInputValue } from "./format";

const maximumAmountIdr = 999_999_999_999;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const requiredText = (message: string) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value : ""),
    z.string().trim().min(1, message),
  );

function isRealDate(value: string) {
  if (!datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const transactionFormSchema = z.object({
  amountIdr: requiredText("Masukkan nominal transaksi.")
    .refine(
      (value) => /^[\d.\s]+$/.test(value),
      "Gunakan angka bulat tanpa tanda minus.",
    )
    .transform((value) => value.replace(/[.\s]/g, ""))
    .refine((value) => /^\d+$/.test(value), "Nominal tidak valid.")
    .transform(Number)
    .refine(Number.isSafeInteger, "Nominal terlalu besar.")
    .refine((value) => value >= 1, "Nominal minimal Rp1.")
    .refine(
      (value) => value <= maximumAmountIdr,
      "Nominal maksimal Rp999.999.999.999.",
    ),
  categoryId: requiredText("Pilih kategori transaksi.").pipe(
    z.string().uuid("Kategori tidak valid."),
  ),
  notes: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z
      .string()
      .max(1000, "Catatan maksimal 1.000 karakter.")
      .transform((value) => (value.length > 0 ? value : null)),
  ),
  transactionDate: requiredText("Pilih tanggal transaksi.")
    .refine(isRealDate, "Tanggal transaksi tidak valid.")
    .refine(
      (value) => value <= getJakartaDateInputValue(),
      "Tanggal transaksi tidak boleh melewati hari ini.",
    ),
});

export const transactionIdSchema = z
  .string()
  .uuid("Identitas transaksi tidak valid.");

export type ParsedTransactionInput = z.infer<typeof transactionFormSchema>;

function getFormValue(formData: FormData, key: TransactionField) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export function getTransactionFormValues(
  formData: FormData,
): TransactionFormValues {
  return {
    amountIdr: getFormValue(formData, "amountIdr"),
    categoryId: getFormValue(formData, "categoryId"),
    notes: getFormValue(formData, "notes"),
    transactionDate: getFormValue(formData, "transactionDate"),
  };
}

export function parseTransactionForm(formData: FormData) {
  const values = getTransactionFormValues(formData);
  const result = transactionFormSchema.safeParse(values);

  if (result.success) {
    return {
      data: result.data,
      success: true,
      values,
    } as const;
  }

  const flattened = result.error.flatten().fieldErrors;
  const fieldErrors: Partial<Record<TransactionField, string>> = {};

  for (const field of Object.keys(values) as TransactionField[]) {
    const message = flattened[field]?.[0];

    if (message) {
      fieldErrors[field] = message;
    }
  }

  return {
    state: {
      fieldErrors,
      formError: "Periksa kembali field yang ditandai.",
      status: "error",
      values,
    } satisfies TransactionActionState,
    success: false,
  } as const;
}
