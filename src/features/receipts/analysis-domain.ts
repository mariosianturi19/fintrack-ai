import { z } from "zod";

import { RECEIPT_MAX_ITEMS } from "./constants";
import type {
  ReceiptAnalysisDraft,
  ReceiptReviewIssue,
  ReceiptReviewItem,
} from "./domain";

const categorySlugs = [
  "food-drink",
  "transportation",
  "shopping",
  "bills",
  "health",
  "other",
] as const;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const maximumAmountIdr = 999_999_999_999;

const nullableText = (maximum: number) => z.string().max(maximum).nullable();

const nullableAmount = z.number().int().min(1).max(maximumAmountIdr).nullable();

export const geminiReceiptOutputSchema = z.object({
  amountIdr: nullableAmount,
  categorySlug: z.enum(categorySlugs).nullable(),
  items: z
    .array(
      z.object({
        name: z.string().min(1).max(160),
        quantity: nullableText(60),
        totalPriceIdr: nullableAmount,
        unitPriceIdr: nullableAmount,
      }),
    )
    .max(RECEIPT_MAX_ITEMS),
  merchant: nullableText(120),
  notes: nullableText(1_000),
  transactionDate: nullableText(10),
});

export const geminiReceiptJsonSchema = {
  additionalProperties: false,
  properties: {
    amountIdr: { anyOf: [{ type: "integer" }, { type: "null" }] },
    categorySlug: {
      anyOf: [{ enum: categorySlugs, type: "string" }, { type: "null" }],
    },
    items: {
      items: {
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          quantity: { anyOf: [{ type: "string" }, { type: "null" }] },
          totalPriceIdr: {
            anyOf: [{ type: "integer" }, { type: "null" }],
          },
          unitPriceIdr: {
            anyOf: [{ type: "integer" }, { type: "null" }],
          },
        },
        required: ["name", "quantity", "totalPriceIdr", "unitPriceIdr"],
        type: "object",
      },
      type: "array",
    },
    merchant: { anyOf: [{ type: "string" }, { type: "null" }] },
    notes: { anyOf: [{ type: "string" }, { type: "null" }] },
    transactionDate: {
      anyOf: [{ type: "string" }, { type: "null" }],
    },
  },
  required: [
    "merchant",
    "amountIdr",
    "transactionDate",
    "categorySlug",
    "items",
    "notes",
  ],
  type: "object",
} as const;

function sanitizeText(value: string | null, maximum: number): string | null {
  if (!value) {
    return null;
  }

  const sanitized = value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/(?:\d[\s-]?){12,19}/g, "[disamarkan]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maximum);

  return sanitized.length > 0 ? sanitized : null;
}

function isRealDate(value: string): boolean {
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

function sanitizeItem(
  item: z.infer<typeof geminiReceiptOutputSchema>["items"][number],
): ReceiptReviewItem | null {
  const name = sanitizeText(item.name, 160);

  if (!name) {
    return null;
  }

  return {
    name,
    quantity: sanitizeText(item.quantity, 60),
    totalPriceIdr: item.totalPriceIdr,
    unitPriceIdr: item.unitPriceIdr,
  };
}

export function parseGeminiReceiptOutput(
  value: unknown,
  maximumDate: string,
): Readonly<{
  draft: ReceiptAnalysisDraft;
  reviewIssues: readonly ReceiptReviewIssue[];
}> {
  const parsed = geminiReceiptOutputSchema.parse(value);
  const merchant = sanitizeText(parsed.merchant, 120);
  const notes = sanitizeText(parsed.notes, 1_000);
  const transactionDate =
    parsed.transactionDate &&
    isRealDate(parsed.transactionDate) &&
    parsed.transactionDate <= maximumDate
      ? parsed.transactionDate
      : null;
  const items = parsed.items
    .map(sanitizeItem)
    .filter((item): item is ReceiptReviewItem => item !== null);
  const reviewIssues: ReceiptReviewIssue[] = [];

  if (!merchant) {
    reviewIssues.push({
      field: "merchant",
      message: "Nama merchant belum terbaca. Isi jika terlihat pada struk.",
    });
  }

  if (!parsed.amountIdr) {
    reviewIssues.push({
      field: "amountIdr",
      message: "Total wajib diperiksa dan diisi sebelum disimpan.",
    });
  }

  if (!transactionDate) {
    reviewIssues.push({
      field: "transactionDate",
      message: "Tanggal belum valid dan perlu kamu pilih.",
    });
  }

  if (!parsed.categorySlug) {
    reviewIssues.push({
      field: "categorySlug",
      message: "Kategori perlu kamu tentukan.",
    });
  }

  return {
    draft: {
      amountIdr: parsed.amountIdr,
      categorySlug: parsed.categorySlug,
      items,
      merchant,
      notes,
      transactionDate,
    },
    reviewIssues,
  };
}
