import { z } from "zod";

import { RECEIPT_MAX_ITEMS } from "./constants";

const maximumAmountIdr = 999_999_999_999;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const sensitiveNumberPattern = /(?:\d[\s-]?){12,19}/g;

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z
      .string()
      .max(maximum)
      .transform((value) =>
        value.length > 0
          ? value.replace(sensitiveNumberPattern, "[disamarkan]")
          : null,
      ),
  );

const optionalItemAmount = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().int().min(1).max(maximumAmountIdr).nullable(),
);

const receiptReviewItemSchema = z.object({
  name: z.string().trim().min(1).max(160),
  quantity: optionalText(60),
  totalPriceIdr: optionalItemAmount,
  unitPriceIdr: optionalItemAmount,
});

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

function parseItemsJson(value: unknown): unknown {
  if (typeof value !== "string" || value.length > 100_000) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const receiptReviewFormSchema = z.object({
  amountIdr: z
    .string()
    .trim()
    .min(1, "Masukkan total transaksi.")
    .refine((value) => /^[\d.\s]+$/.test(value), "Total tidak valid.")
    .transform((value) => value.replace(/[.\s]/g, ""))
    .refine((value) => /^\d+$/.test(value), "Total tidak valid.")
    .transform(Number)
    .refine(Number.isSafeInteger, "Total terlalu besar.")
    .refine((value) => value >= 1, "Total minimal Rp1.")
    .refine(
      (value) => value <= maximumAmountIdr,
      "Total maksimal Rp999.999.999.999.",
    ),
  categoryId: z.string().uuid("Pilih kategori transaksi."),
  items: z.preprocess(
    parseItemsJson,
    z.array(receiptReviewItemSchema).max(RECEIPT_MAX_ITEMS),
  ),
  merchant: optionalText(120),
  notes: optionalText(1_000),
  transactionDate: z
    .string()
    .refine(isRealDate, "Pilih tanggal transaksi yang valid."),
  uploadId: z.string().uuid("Identitas foto tidak valid."),
});

export type ParsedReceiptReviewInput = z.infer<typeof receiptReviewFormSchema>;

export type ReceiptReviewField =
  | "amountIdr"
  | "categoryId"
  | "items"
  | "merchant"
  | "notes"
  | "transactionDate";

export type ReceiptReviewActionState = Readonly<{
  fieldErrors: Partial<Record<ReceiptReviewField, string>>;
  formError?: string;
  status: "idle" | "error";
}>;

export function parseReceiptReviewForm(
  formData: FormData,
  maximumDate: string,
):
  | Readonly<{ data: ParsedReceiptReviewInput; success: true }>
  | Readonly<{ state: ReceiptReviewActionState; success: false }> {
  const result = receiptReviewFormSchema.safeParse({
    amountIdr: formData.get("amountIdr"),
    categoryId: formData.get("categoryId"),
    items: formData.get("items"),
    merchant: formData.get("merchant"),
    notes: formData.get("notes"),
    transactionDate: formData.get("transactionDate"),
    uploadId: formData.get("uploadId"),
  });

  if (!result.success) {
    const flattened = result.error.flatten().fieldErrors;

    return {
      state: {
        fieldErrors: {
          amountIdr: flattened.amountIdr?.[0],
          categoryId: flattened.categoryId?.[0],
          items: flattened.items?.[0],
          merchant: flattened.merchant?.[0],
          notes: flattened.notes?.[0],
          transactionDate: flattened.transactionDate?.[0],
        },
        formError: "Periksa kembali field yang ditandai.",
        status: "error",
      },
      success: false,
    };
  }

  if (result.data.transactionDate > maximumDate) {
    return {
      state: {
        fieldErrors: {
          transactionDate: "Tanggal transaksi tidak boleh melewati hari ini.",
        },
        formError: "Periksa kembali field yang ditandai.",
        status: "error",
      },
      success: false,
    };
  }

  return { data: result.data, success: true };
}
