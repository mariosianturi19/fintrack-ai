import { z } from "zod";

import {
  RECEIPT_MAX_SOURCE_BYTES,
  RECEIPT_MAX_UPLOAD_BYTES,
  RECEIPT_SOURCE_TYPES,
  RECEIPT_UPLOAD_TYPE,
} from "./constants";

export const receiptUploadRequestSchema = z.object({
  contentType: z.literal(RECEIPT_UPLOAD_TYPE),
  sizeBytes: z.number().int().min(1).max(RECEIPT_MAX_UPLOAD_BYTES),
});

export const receiptUploadOperationSchema = z.object({
  uploadId: z.string().uuid(),
});

export const receiptAnalysisRequestSchema = z.object({
  requestId: z.string().uuid(),
  uploadId: z.string().uuid(),
});

export type ReceiptSourceMetadata = Readonly<{
  size: number;
  type: string;
}>;

export type ReceiptSourceValidationResult =
  Readonly<{ valid: true }> | Readonly<{ message: string; valid: false }>;

export function validateReceiptSource(
  source: ReceiptSourceMetadata,
): ReceiptSourceValidationResult {
  if (!RECEIPT_SOURCE_TYPES.includes(source.type as never)) {
    return {
      message: "Gunakan foto berformat JPG, PNG, atau WebP.",
      valid: false,
    };
  }

  if (source.size < 1) {
    return {
      message: "File foto kosong dan tidak dapat diproses.",
      valid: false,
    };
  }

  if (source.size > RECEIPT_MAX_SOURCE_BYTES) {
    return {
      message: "Ukuran foto awal maksimal 15 MB.",
      valid: false,
    };
  }

  return { valid: true };
}
