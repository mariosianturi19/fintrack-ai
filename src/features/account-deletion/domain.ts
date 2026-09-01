import { z } from "zod";

export const deletionRequestSchema = z.discriminatedUnion("action", [
  z
    .object({ action: z.literal("request"), confirmation: z.literal("HAPUS") })
    .strict(),
  z.object({ action: z.literal("retry") }).strict(),
]);

export const deletionJobSchema = z.object({
  user_id: z.string().uuid(),
  request_id: z.string().uuid(),
  requested_at: z.string().datetime({ offset: true }),
  not_before: z.string().datetime({ offset: true }),
  lease_token: z.string().uuid().nullable(),
  lease_until: z.string().datetime({ offset: true }).nullable(),
  attempts: z.number().int().nonnegative(),
  last_error_code: z.enum(["storage", "auth", "database"]).nullable(),
});
export type DeletionJob = z.infer<typeof deletionJobSchema>;
export type DeletionErrorCode = NonNullable<DeletionJob["last_error_code"]>;

export const deletionStatusSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("active") }),
  z.object({ status: z.literal("complete") }),
  z.object({
    status: z.literal("pending"),
    retryAfterSeconds: z.number().int().nonnegative(),
    retryNeeded: z.boolean(),
  }),
]);
export type DeletionStatus = z.infer<typeof deletionStatusSchema>;

export function pendingDeletionStatus(
  job: DeletionJob,
  now = Date.now(),
): DeletionStatus {
  const due = Math.max(
    new Date(job.not_before).getTime(),
    job.lease_until ? new Date(job.lease_until).getTime() : 0,
  );
  return {
    status: "pending",
    retryAfterSeconds: Math.max(0, Math.ceil((due - now) / 1000)),
    retryNeeded: job.last_error_code !== null,
  };
}

export class AccountDeletionError extends Error {
  constructor(public readonly code: DeletionErrorCode) {
    super(code);
    this.name = "AccountDeletionError";
  }
}
