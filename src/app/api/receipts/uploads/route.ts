import { getAuthenticatedUserId } from "@/lib/auth/session";
import { isSameOriginMutation } from "@/features/receipts/request-security";
import {
  confirmReceiptUpload,
  createReceiptUploadTicket,
  deletePendingReceiptUpload,
  ReceiptStorageError,
} from "@/features/receipts/storage";
import {
  receiptUploadOperationSchema,
  receiptUploadRequestSchema,
} from "@/features/receipts/validation";

export const dynamic = "force-dynamic";

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
    return jsonResponse({ message: "Permintaan upload tidak valid." }, 403);
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonResponse(
      { message: "Sesi tidak valid. Silakan login kembali." },
      401,
    );
  }

  const input = receiptUploadRequestSchema.safeParse(await readJson(request));

  if (!input.success) {
    return jsonResponse(
      { message: "Foto harus berupa JPEG dengan ukuran maksimal 500 KB." },
      400,
    );
  }

  try {
    const ticket = await createReceiptUploadTicket(
      userId,
      crypto.randomUUID(),
      input.data.sizeBytes,
    );

    return jsonResponse(ticket, 201);
  } catch (error) {
    const message =
      error instanceof ReceiptStorageError
        ? error.message
        : "Tiket upload belum dapat dibuat.";

    return jsonResponse({ message }, 503);
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonResponse({ message: "Permintaan verifikasi tidak valid." }, 403);
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonResponse(
      { message: "Sesi tidak valid. Silakan login kembali." },
      401,
    );
  }

  const input = receiptUploadOperationSchema.safeParse(await readJson(request));

  if (!input.success) {
    return jsonResponse({ message: "Identitas upload tidak valid." }, 400);
  }

  try {
    const confirmation = await confirmReceiptUpload(
      userId,
      input.data.uploadId,
    );

    return jsonResponse(confirmation, 200);
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

    return jsonResponse({ message: "Foto belum dapat diverifikasi." }, 503);
  }
}

export async function DELETE(request: Request) {
  if (!isSameOriginMutation(request)) {
    return jsonResponse({ message: "Permintaan cleanup tidak valid." }, 403);
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return jsonResponse(
      { message: "Sesi tidak valid. Silakan login kembali." },
      401,
    );
  }

  const input = receiptUploadOperationSchema.safeParse(await readJson(request));

  if (!input.success) {
    return jsonResponse({ message: "Identitas upload tidak valid." }, 400);
  }

  try {
    await deletePendingReceiptUpload(userId, input.data.uploadId);
    return new Response(null, { headers: responseHeaders, status: 204 });
  } catch (error) {
    const message =
      error instanceof ReceiptStorageError
        ? error.message
        : "Foto sementara belum dapat dihapus.";

    return jsonResponse({ message }, 503);
  }
}
