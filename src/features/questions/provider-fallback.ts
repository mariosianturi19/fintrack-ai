import { isFinanceQuestionResponseError } from "./response";

export const FINANCE_QUESTION_FALLBACK_MODEL = "gemini-3.5-flash-lite";

export function getProviderStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

export function shouldUseFinanceQuestionFallback(error: unknown) {
  const status = getProviderStatus(error);
  return (
    status === 503 || status === 504 || isFinanceQuestionResponseError(error)
  );
}
