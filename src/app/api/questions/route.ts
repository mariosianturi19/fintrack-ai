import { isSameOriginMutation } from "@/features/receipts/request-security";
import { getFinanceQuestionContext } from "@/features/questions/data";
import { answerFinanceQuestion } from "@/features/questions/gemini";
import { consumeFinanceQuestionQuota } from "@/features/questions/rate-limit";
import { financeQuestionRequestSchema } from "@/features/questions/validation";
import { getAuthenticatedUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

function json(body: unknown, status: number) {
  return Response.json(body, { headers, status });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return json({ message: "Permintaan pertanyaan tidak valid." }, 403);
  }
  if (!(await getAuthenticatedUserId())) {
    return json({ message: "Sesi tidak valid. Silakan login kembali." }, 401);
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // Validation below returns a stable client message.
  }
  const input = financeQuestionRequestSchema.safeParse(body);
  if (!input.success) {
    return json(
      { message: "Pertanyaan atau rentang waktunya belum valid." },
      400,
    );
  }

  try {
    const context = await getFinanceQuestionContext(
      input.data.startDate,
      input.data.endDate,
    );
    if (context.overall.transactionCount === 0) {
      return json(
        {
          message:
            "Belum ada transaksi pada periode ini. Pilih periode lain atau catat transaksi terlebih dahulu.",
          reason: "empty",
        },
        422,
      );
    }

    const quota = await consumeFinanceQuestionQuota(input.data.requestId);
    if (!quota.accepted) {
      const message =
        quota.reason === "minute"
          ? "Terlalu banyak pertanyaan dalam satu menit. Tunggu sebentar lalu coba lagi."
          : quota.reason === "duplicate"
            ? "Pertanyaan ini sudah diproses. Kirim ulang untuk membuat permintaan baru."
            : "Batas pertanyaan AI hari ini sudah tercapai. Coba kembali besok.";
      return json(
        { message, reason: quota.reason, retryAt: quota.retryAt },
        quota.reason === "duplicate" ? 409 : 429,
      );
    }

    const answer = await answerFinanceQuestion(input.data.question, context);
    return json(
      {
        answer,
        period: context.period,
        requestId: input.data.requestId,
      },
      200,
    );
  } catch (error) {
    console.error("[Fintrack AI] Pertanyaan pengeluaran gagal.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return json(
      {
        message:
          "Jawaban AI belum tersedia. Data transaksi tetap aman dan kamu dapat mencoba lagi nanti.",
      },
      503,
    );
  }
}
