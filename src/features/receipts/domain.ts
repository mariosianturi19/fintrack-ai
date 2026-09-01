export type ReceiptUploadTicket = Readonly<{
  expiresAt: string;
  uploadId: string;
  uploadUrl: string;
}>;

export type ReceiptUploadConfirmation = Readonly<{
  expiresAt: string;
  previewUrl: string;
  sizeBytes: number;
  uploadId: string;
}>;

export type ReceiptReviewItem = Readonly<{
  name: string;
  quantity: string | null;
  totalPriceIdr: number | null;
  unitPriceIdr: number | null;
}>;

export type ReceiptReviewIssueField =
  "amountIdr" | "categorySlug" | "merchant" | "transactionDate";

export type ReceiptReviewIssue = Readonly<{
  field: ReceiptReviewIssueField;
  message: string;
}>;

export type ReceiptAnalysisDraft = Readonly<{
  amountIdr: number | null;
  categorySlug: string | null;
  items: readonly ReceiptReviewItem[];
  merchant: string | null;
  notes: string | null;
  transactionDate: string | null;
}>;

export type ReceiptAnalysisResult = Readonly<{
  draft: ReceiptAnalysisDraft;
  requestId: string;
  reviewIssues: readonly ReceiptReviewIssue[];
  uploadId: string;
}>;
