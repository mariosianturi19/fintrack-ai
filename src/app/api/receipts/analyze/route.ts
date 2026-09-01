import {
  analyzeReceiptImage,
  ReceiptAnalysisError,
} from "@/features/receipts/gemini";
import { consumeReceiptAiQuota } from "@/features/receipts/rate-limit";
import { isSameOriginMutation } from "@/features/receipts/request-security";
import {
  readPendingReceiptImage,
  ReceiptStorageError,
} from "@/features/receipts/storage";
import { receiptAnalysisRequestSchema } from "@/features/receipts/validation";
import { getJakartaDateInputValue } from "@/features/transactions/format";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

function jsonResponse(body: unknown, status: number) {
  return Response.json(body, { headers: responseHeaders, status });
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonResponse(
      { message: "Permintaan pemeriksaan tidak valid." },
      403,
    );
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonResponse(
      { message: "Sesi tidak valid. Silakan login kembali." },
      401,
    );
  }

  const input = receiptAnalysisRequestSchema.safeParse(await readJson(request));

  if (!input.success) {
    return jsonResponse({ message: "Identitas pemeriksaan tidak valid." }, 400);
  }

  try {
    const image = await readPendingReceiptImage(userId, input.data.uploadId);
    const quota = await consumeReceiptAiQuota(input.data.requestId);

    if (!quota.accepted) {
      const message =
        quota.reason === "day"
          ? "Batas pemeriksaan AI hari ini sudah tercapai. Masukkan transaksi manual atau coba besok."
          : quota.reason === "minute"
            ? "Terlalu banyak pemeriksaan dalam satu menit. Tunggu sebentar lalu coba lagi."
            : "Permintaan ini sudah pernah diproses. Tekan coba lagi untuk membuat pemeriksaan baru.";

      return jsonResponse(
        { message, reason: quota.reason, retryAt: quota.retryAt },
        quota.reason === "duplicate" ? 409 : 429,
      );
    }

    const result = await analyzeReceiptImage(image, getJakartaDateInputValue());

    return jsonResponse(
      {
        ...result,
        requestId: input.data.requestId,
        uploadId: input.data.uploadId,
      },
      200,
    );
  } catch (error) {
    if (error instanceof ReceiptStorageError) {
      const status =
        error.code === "not_found"
          ? 404
          : error.code === "invalid_object"
            ? 422
            : 503;

      return jsonResponse({ message: error.message }, status);
    }

    if (error instanceof ReceiptAnalysisError) {
      const status = error.code === "configuration" ? 503 : 502;
      return jsonResponse(
        { message: error.message, reason: error.code },
        status,
      );
    }

    return jsonResponse(
      {
        message:
          "Pemeriksaan AI belum dapat dimulai. Coba lagi atau masukkan transaksi manual.",
      },
      503,
    );
  }
}
