import type { Row, SheetData } from "write-excel-file/node";

import type { TransactionRecord } from "./domain";
import { getTransactionSourceLabel } from "./format";

const spreadsheetFormulaPrefix = /^\s*[=+\-@]/;

export type TransactionExportRow = Readonly<{
  amountIdr: number;
  category: string;
  createdAt: string;
  id: string;
  merchant: string;
  notes: string;
  source: string;
  transactionDate: string;
  updatedAt: string;
}>;

export function neutralizeSpreadsheetFormula(value: string) {
  const normalized = value.replaceAll("\u0000", "");

  return spreadsheetFormulaPrefix.test(normalized)
    ? `'${normalized}`
    : normalized;
}

export function buildTransactionExportRows(
  transactions: readonly TransactionRecord[],
): readonly TransactionExportRow[] {
  return transactions.map((transaction) => ({
    amountIdr: transaction.amountIdr,
    category: neutralizeSpreadsheetFormula(transaction.category.name),
    createdAt: transaction.createdAt,
    id: transaction.id,
    merchant: neutralizeSpreadsheetFormula(transaction.merchant ?? ""),
    notes: neutralizeSpreadsheetFormula(transaction.notes ?? ""),
    source: getTransactionSourceLabel(transaction.source),
    transactionDate: transaction.transactionDate,
    updatedAt: transaction.updatedAt,
  }));
}

function escapeCsvCell(value: string | number) {
  const text = String(value);

  return `"${text.replaceAll('"', '""')}"`;
}

export function createTransactionsCsv(
  transactions: readonly TransactionRecord[],
) {
  const rows = buildTransactionExportRows(transactions);
  const headers = [
    "ID",
    "Tanggal",
    "Merchant",
    "Catatan",
    "Kategori",
    "Nominal (IDR)",
    "Sumber",
    "Dibuat pada",
    "Diperbarui pada",
  ];
  const csvRows = rows.map((row) =>
    [
      row.id,
      row.transactionDate,
      row.merchant,
      row.notes,
      row.category,
      row.amountIdr,
      row.source,
      row.createdAt,
      row.updatedAt,
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  return `\uFEFF${[headers.map(escapeCsvCell).join(","), ...csvRows].join("\r\n")}`;
}

export async function createTransactionsXlsx(
  transactions: readonly TransactionRecord[],
) {
  const { default: writeXlsxFile } = await import("write-excel-file/node");
  const rows = buildTransactionExportRows(transactions);
  const header = (value: string) => ({
    backgroundColor: "#DCEAF0",
    fontWeight: "bold" as const,
    value,
  });
  const sheetData: SheetData = [
    [
      header("ID"),
      header("Tanggal"),
      header("Merchant"),
      header("Catatan"),
      header("Kategori"),
      header("Nominal (IDR)"),
      header("Sumber"),
      header("Dibuat pada"),
      header("Diperbarui pada"),
    ],
    ...rows.map((row): Row => [
      row.id,
      row.transactionDate,
      row.merchant,
      row.notes,
      row.category,
      { format: "#,##0", type: Number, value: row.amountIdr },
      row.source,
      row.createdAt,
      row.updatedAt,
    ]),
  ];

  return writeXlsxFile(
    sheetData,
    {
      columns: [
        { width: 38 },
        { width: 14 },
        { width: 24 },
        { width: 34 },
        { width: 22 },
        { width: 18 },
        { width: 14 },
        { width: 26 },
        { width: 26 },
      ],
      sheet: "Transaksi",
      showGridLines: false,
      stickyRowsCount: 1,
    },
    {
      fontFamily: "IBM Plex Sans",
      fontSize: 11,
    },
  ).toBuffer();
}

export function createTransactionExportFilename(
  format: "csv" | "xlsx",
  date = new Date(),
) {
  const datePart = date.toISOString().slice(0, 10);

  return `fintrack-ai-transactions-${datePart}.${format}`;
}
