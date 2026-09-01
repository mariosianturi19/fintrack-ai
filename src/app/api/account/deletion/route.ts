import { cookies } from "next/headers";

import {
  beginAccountDeletion,
  createDeletionDependencies,
  isAuthAccountAbsent,
  readDeletionJob,
} from "@/features/account-deletion/data";
import {
  deletionRequestSchema,
  pendingDeletionStatus,
  type DeletionJob,
} from "@/features/account-deletion/domain";
import { processAccountDeletion } from "@/features/account-deletion/processor";
import {
  createDeletionReceipt,
  DELETION_COOKIE,
  DELETION_RECEIPT_TTL_SECONDS,
  verifyDeletionReceipt,
} from "@/features/account-deletion/receipt-token";
import { isSameOriginMutation } from "@/features/receipts/request-security";
import { getAccountSession } from "@/lib/auth/session";
import { environment } from "@/lib/env/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers });
const unavailable = () =>
  json(
    {
      message:
        "Status penghapusan belum dapat diperiksa. Coba lagi; jangan anggap data sudah terhapus.",
    },
    503,
  );

async function setReceipt(job: DeletionJob) {
  const cookieStore = await cookies();
  cookieStore.set(
    DELETION_COOKIE,
    createDeletionReceipt(
      job.user_id,
      job.request_id,
      environment.CRON_SECRET!,
    ),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: DELETION_RECEIPT_TTL_SECONDS,
    },
  );
}

async function resolveStatusOwner() {
  const session = await getAccountSession();
  const cookieStore = await cookies();
  const receipt = verifyDeletionReceipt(
    cookieStore.get(DELETION_COOKIE)?.value,
    environment.CRON_SECRET ?? "",
  );
  if (receipt && (!session || session.userId === receipt.userId)) {
    const job = await readDeletionJob(receipt.userId);
    if (job && job.request_id !== receipt.requestId) return null;
    if (!job && !(await isAuthAccountAbsent(receipt.userId))) return null;
    return { userId: receipt.userId, job, session };
  }
  if (!session) return null;
  return {
    userId: session.userId,
    job: await readDeletionJob(session.userId),
    session,
  };
}

export async function GET() {
  try {
    const owner = await resolveStatusOwner();
    if (!owner)
      return json(
        { message: "Login diperlukan untuk memeriksa status akun." },
        401,
      );
    return json(
      owner.job
        ? pendingDeletionStatus(owner.job)
        : { status: owner.session ? "active" : "complete" },
    );
  } catch {
    return unavailable();
  }
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request))
    return json({ message: "Permintaan penghapusan tidak valid." }, 403);
  if (
    !environment.CRON_SECRET ||
    environment.CRON_SECRET.length < 32 ||
    !environment.SUPABASE_SECRET_KEY
  )
    return unavailable();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Konfirmasi penghapusan tidak valid." }, 400);
  }
  const input = deletionRequestSchema.safeParse(body);
  if (!input.success)
    return json(
      { message: "Ketik HAPUS dengan tepat untuk mengonfirmasi." },
      400,
    );
  try {
    if (input.data.action === "request") {
      const session = await getAccountSession();
      if (!session)
        return json(
          { message: "Sesi tidak valid. Silakan login kembali." },
          401,
        );
      const job = await beginAccountDeletion(session.userId);
      // Issue the receipt BEFORE destructive processing, so reloads can recover
      // after Auth deletion. A lost response can safely repeat this request.
      await setReceipt(job);
      return json(pendingDeletionStatus(job), 202);
    }
    const owner = await resolveStatusOwner();
    if (!owner)
      return json(
        { message: "Sesi penghapusan tidak valid. Silakan login kembali." },
        401,
      );
    if (!owner.job && owner.session) return json({ status: "active" });
    if (owner.job) await setReceipt(owner.job);
    const status = owner.job
      ? await processAccountDeletion(owner.userId, createDeletionDependencies())
      : { status: "complete" as const };
    if (status.status === "complete") {
      const supabase = await createClient();
      await supabase.auth.signOut({ scope: "local" });
      (await cookies()).delete(DELETION_COOKIE);
    }
    return json(status, status.status === "pending" ? 202 : 200);
  } catch {
    return unavailable();
  }
}
