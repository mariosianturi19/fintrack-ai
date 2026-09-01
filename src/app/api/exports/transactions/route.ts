import { getAuthenticatedUserId } from "@/lib/auth/session";
import {
  listOwnedTransactionsForExport,
  TransactionDataError,
} from "@/features/transactions/data";
import {
  createTransactionExportFilename,
  createTransactionsCsv,
  createTransactionsXlsx,
} from "@/features/transactions/export";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  const format = new URL(request.url).searchParams.get("format");

  if (format !== "csv" && format !== "xlsx") {
    return new Response("Format export tidak didukung.", {
      headers: responseHeaders,
      status: 400,
    });
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return new Response("Sesi tidak valid. Silakan login kembali.", {
      headers: responseHeaders,
      status: 401,
    });
  }

  try {
    const transactions = await listOwnedTransactionsForExport(userId);
    const filename = createTransactionExportFilename(format);

    if (format === "csv") {
      return new Response(createTransactionsCsv(transactions), {
        headers: {
          ...responseHeaders,
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Type": "text/csv; charset=utf-8",
        },
      });
    }

    const buffer = await createTransactionsXlsx(transactions);

    return new Response(new Uint8Array(buffer), {
      headers: {
        ...responseHeaders,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    if (
      error instanceof TransactionDataError &&
      error.code === "export_limit"
    ) {
      return new Response(
        "Data terlalu banyak untuk satu file. Kurangi data sebelum mencoba lagi.",
        { headers: responseHeaders, status: 413 },
      );
    }

    console.error("[Fintrack AI] Export transaksi gagal.", error);
    return new Response(
      "Export belum berhasil. Data tetap aman; coba lagi beberapa saat.",
      { headers: responseHeaders, status: 500 },
    );
  }
}
