export type TransactionSource = "manual" | "receipt_ai";

export type TransactionReceiptItem = Readonly<{
  name: string;
  quantity: string | null;
  totalPriceIdr: number | null;
  unitPriceIdr: number | null;
}>;

export type TransactionCategory = Readonly<{
  colorHex: string;
  id: string;
  isActive: boolean;
  name: string;
  slug: string;
  sortOrder: number;
}>;

export type TransactionRecord = Readonly<{
  amountIdr: number;
  category: TransactionCategory;
  categoryId: string;
  createdAt: string;
  id: string;
  merchant: string | null;
  notes: string | null;
  receiptItems: readonly TransactionReceiptItem[];
  receiptObjectKey: string | null;
  source: TransactionSource;
  transactionDate: string;
  updatedAt: string;
}>;

export type TransactionFormValues = Readonly<{
  amountIdr: string;
  categoryId: string;
  notes: string;
  transactionDate: string;
}>;

export type TransactionField = keyof TransactionFormValues;

export type TransactionActionState = Readonly<{
  fieldErrors: Partial<Record<TransactionField, string>>;
  formError?: string;
  status: "idle" | "error";
  values: TransactionFormValues;
}>;

export type TransactionPage = Readonly<{
  currentPage: number;
  pageCount: number;
  pageSize: number;
  total: number;
  transactions: readonly TransactionRecord[];
}>;

export type TransactionEditorData = Readonly<{
  categories: readonly TransactionCategory[];
  transaction: TransactionRecord;
}>;
