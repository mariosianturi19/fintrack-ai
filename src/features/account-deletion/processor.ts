import type { DeletionErrorCode, DeletionJob, DeletionStatus } from "./domain";
import { AccountDeletionError, pendingDeletionStatus } from "./domain";

export type DeletionDependencies = {
  claim: (userId: string) => Promise<DeletionJob | null>;
  read: (userId: string) => Promise<DeletionJob | null>;
  cleanStorage: (userId: string) => Promise<boolean>;
  deleteAuth: (userId: string) => Promise<void>;
  verifyDatabase: (userId: string) => Promise<boolean>;
  finish: (job: DeletionJob) => Promise<boolean>;
  release: (
    job: DeletionJob,
    errorCode: DeletionErrorCode | null,
  ) => Promise<void>;
};

// No user-supplied prefix/ID enters here: callers resolve a live session or a
// signed deletion receipt first. Every external failure leaves the durable job.
export async function processAccountDeletion(
  userId: string,
  dependencies: DeletionDependencies,
): Promise<DeletionStatus> {
  const job = await dependencies.claim(userId);
  if (!job) {
    const current = await dependencies.read(userId);
    if (current) return pendingDeletionStatus(current);
    if (!(await dependencies.verifyDatabase(userId)))
      throw new AccountDeletionError("database");
    return { status: "complete" };
  }
  try {
    if (!(await dependencies.cleanStorage(userId))) {
      await dependencies.release(job, null);
      return { status: "pending", retryAfterSeconds: 5, retryNeeded: false };
    }
    await dependencies.deleteAuth(userId);
    if (!(await dependencies.verifyDatabase(userId))) {
      throw new AccountDeletionError("database");
    }
    // Re-list AFTER Auth removal too; keep the queue if a late object appeared.
    if (!(await dependencies.cleanStorage(userId))) {
      await dependencies.release(job, null);
      return { status: "pending", retryAfterSeconds: 5, retryNeeded: false };
    }
    if (!(await dependencies.finish(job))) {
      return { status: "pending", retryAfterSeconds: 15, retryNeeded: false };
    }
    return { status: "complete" };
  } catch (error) {
    const code =
      error instanceof AccountDeletionError ? error.code : "database";
    await dependencies.release(job, code);
    return { status: "pending", retryAfterSeconds: 30, retryNeeded: true };
  }
}
