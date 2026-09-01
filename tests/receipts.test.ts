import { describe, expect, it } from "vitest";

import { fitWithinDimensions } from "../src/features/receipts/compression";
import { RECEIPT_MAX_UPLOAD_BYTES } from "../src/features/receipts/constants";
import {
  geminiReceiptJsonSchema,
  parseGeminiReceiptOutput,
} from "../src/features/receipts/analysis-domain";
import {
  createPendingReceiptObjectKey,
  createReceiptObjectKey,
  isOwnedReceiptObjectKey,
} from "../src/features/receipts/object-key";
import { isSameOriginMutation } from "../src/features/receipts/request-security";
import { parseReceiptReviewForm } from "../src/features/receipts/review-validation";
import {
  receiptUploadOperationSchema,
  receiptUploadRequestSchema,
  validateReceiptSource,
} from "../src/features/receipts/validation";

const userId = "a70d6b83-c68f-4af6-954d-8f26d155a3f0";
const uploadId = "6f0f9726-eb02-4e32-aa36-b5f15d459b2b";

describe("receipt source validation", () => {
  it("accepts supported image sources within the source limit", () => {
    expect(
      validateReceiptSource({ size: 2_000_000, type: "image/jpeg" }),
    ).toEqual({ valid: true });
    expect(validateReceiptSource({ size: 800_000, type: "image/png" })).toEqual(
      {
        valid: true,
      },
    );
  });

  it("rejects unsupported, empty, and oversized source files", () => {
    expect(
      validateReceiptSource({ size: 500, type: "application/pdf" }).valid,
    ).toBe(false);
    expect(validateReceiptSource({ size: 0, type: "image/jpeg" }).valid).toBe(
      false,
    );
    expect(
      validateReceiptSource({ size: 15_000_001, type: "image/webp" }).valid,
    ).toBe(false);
  });
});

describe("receipt image dimensions", () => {
  it("preserves aspect ratio while reducing the longest edge", () => {
    expect(fitWithinDimensions(4_000, 3_000, 2_200)).toEqual({
      height: 1_650,
      width: 2_200,
    });
  });

  it("does not upscale a smaller receipt", () => {
    expect(fitWithinDimensions(1_000, 1_500, 2_200)).toEqual({
      height: 1_500,
      width: 1_000,
    });
  });

  it("rejects invalid dimensions", () => {
    expect(() => fitWithinDimensions(0, 1_000, 2_200)).toThrow(
      "Image dimensions must be positive.",
    );
  });
});

describe("receipt upload boundary", () => {
  it("accepts only normalized JPEG uploads no larger than 500 KB", () => {
    expect(
      receiptUploadRequestSchema.safeParse({
        contentType: "image/jpeg",
        sizeBytes: RECEIPT_MAX_UPLOAD_BYTES,
      }).success,
    ).toBe(true);
    expect(
      receiptUploadRequestSchema.safeParse({
        contentType: "image/png",
        sizeBytes: 50_000,
      }).success,
    ).toBe(false);
    expect(
      receiptUploadRequestSchema.safeParse({
        contentType: "image/jpeg",
        sizeBytes: RECEIPT_MAX_UPLOAD_BYTES + 1,
      }).success,
    ).toBe(false);
  });

  it("accepts only UUID upload operations", () => {
    expect(receiptUploadOperationSchema.safeParse({ uploadId }).success).toBe(
      true,
    );
    expect(
      receiptUploadOperationSchema.safeParse({ uploadId: "../../shared" })
        .success,
    ).toBe(false);
  });

  it("creates an owner-scoped pending object key", () => {
    expect(createPendingReceiptObjectKey(userId, uploadId)).toBe(
      `receipts/pending/${userId}/${uploadId}.jpg`,
    );
    expect(() =>
      createPendingReceiptObjectKey(userId, "../other-user"),
    ).toThrow();
  });

  it("creates and verifies only owner-scoped permanent object keys", () => {
    const key = createReceiptObjectKey(userId, uploadId);

    expect(key).toBe(`receipts/${userId}/${uploadId}.jpg`);
    expect(isOwnedReceiptObjectKey(userId, key)).toBe(true);
    expect(
      isOwnedReceiptObjectKey("cc2da99c-524f-4f16-8cc8-b329a278e1db", key),
    ).toBe(false);
    expect(isOwnedReceiptObjectKey(userId, `${key}/preview`)).toBe(false);
  });
});

describe("receipt AI review boundary", () => {
  it("keeps the provider schema compatible while enforcing item limits in Zod", () => {
    expect(geminiReceiptJsonSchema.properties.items).not.toHaveProperty(
      "maxItems",
    );

    expect(() =>
      parseGeminiReceiptOutput(
        {
          amountIdr: 100_000,
          categorySlug: "shopping",
          items: Array.from({ length: 101 }, (_, index) => ({
            name: `Item ${index + 1}`,
            quantity: null,
            totalPriceIdr: null,
            unitPriceIdr: null,
          })),
          merchant: "Toko QA",
          notes: null,
          transactionDate: "2026-08-16",
        },
        "2026-08-16",
      ),
    ).toThrow();
  });

  it("sanitizes sensitive text and flags missing or invalid fields", () => {
    const result = parseGeminiReceiptOutput(
      {
        amountIdr: null,
        categorySlug: null,
        items: [
          {
            name: " Kopi susu ",
            quantity: "1",
            totalPriceIdr: 25_000,
            unitPriceIdr: 25_000,
          },
        ],
        merchant: "Toko 4111 1111 1111 1111",
        notes: "\u0000Nomor 5555-5555-5555-4444",
        transactionDate: "2999-01-01",
      },
      "2026-08-16",
    );

    expect(result.draft.merchant).toBe("Toko [disamarkan]");
    expect(result.draft.notes).toBe("Nomor [disamarkan]");
    expect(result.draft.transactionDate).toBeNull();
    expect(result.reviewIssues.map((issue) => issue.field)).toEqual([
      "amountIdr",
      "transactionDate",
      "categorySlug",
    ]);
  });

  it("rejects output outside the strict AI schema", () => {
    expect(() =>
      parseGeminiReceiptOutput(
        {
          amountIdr: "25000",
          categorySlug: "crypto",
          items: [],
          merchant: null,
          notes: null,
          transactionDate: null,
        },
        "2026-08-16",
      ),
    ).toThrow();
  });

  it("accepts only a corrected, current receipt review", () => {
    const formData = new FormData();
    formData.set("amountIdr", "25.000");
    formData.set("categoryId", "8ed7db81-5e57-43bb-ab1e-b9afe2273270");
    formData.set(
      "items",
      JSON.stringify([
        {
          name: "Kopi susu",
          quantity: "1",
          totalPriceIdr: "25000",
          unitPriceIdr: "25000",
        },
      ]),
    );
    formData.set("merchant", "Kedai Sela");
    formData.set("notes", "Bayar 4111 1111 1111 1111");
    formData.set("transactionDate", "2026-08-16");
    formData.set("uploadId", uploadId);

    const result = parseReceiptReviewForm(formData, "2026-08-16");

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.amountIdr).toBe(25_000);
      expect(result.data.notes).toBe("Bayar [disamarkan]");
      expect(result.data.items[0].totalPriceIdr).toBe(25_000);
    }
  });

  it("rejects a future reviewed date and malformed item JSON", () => {
    const formData = new FormData();
    formData.set("amountIdr", "25000");
    formData.set("categoryId", "8ed7db81-5e57-43bb-ab1e-b9afe2273270");
    formData.set("items", "not-json");
    formData.set("merchant", "");
    formData.set("notes", "");
    formData.set("transactionDate", "2026-08-17");
    formData.set("uploadId", uploadId);

    const result = parseReceiptReviewForm(formData, "2026-08-16");

    expect(result.success).toBe(false);
  });
});

describe("receipt mutation origin check", () => {
  it("allows the exact application origin", () => {
    const request = new Request("http://localhost:3000/api/receipts/uploads", {
      headers: { Origin: "http://localhost:3000" },
      method: "POST",
    });

    expect(isSameOriginMutation(request)).toBe(true);
  });

  it("rejects absent and cross-origin mutation origins", () => {
    expect(
      isSameOriginMutation(
        new Request("http://localhost:3000/api/receipts/uploads", {
          method: "POST",
        }),
      ),
    ).toBe(false);
    expect(
      isSameOriginMutation(
        new Request("http://localhost:3000/api/receipts/uploads", {
          headers: { Origin: "https://example.test" },
          method: "POST",
        }),
      ),
    ).toBe(false);
  });
});
