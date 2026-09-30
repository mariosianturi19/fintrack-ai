import { z } from "zod";

const outputSchema = z.object({
  answer: z.string().trim().min(1).max(900),
});

export class FinanceQuestionResponseError extends Error {
  constructor() {
    super("invalid_finance_question_response");
    this.name = "FinanceQuestionResponseError";
  }
}

function unwrapJsonCodeFence(value: string) {
  const normalized = value.trim().replace(/^\uFEFF/u, "");
  const fenced = normalized.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/iu);
  return fenced?.[1] ?? normalized;
}

export function parseFinanceQuestionResponse(value: string | undefined) {
  if (!value) throw new FinanceQuestionResponseError();

  try {
    return outputSchema.parse(JSON.parse(unwrapJsonCodeFence(value))).answer;
  } catch {
    throw new FinanceQuestionResponseError();
  }
}

export function isFinanceQuestionResponseError(
  error: unknown,
): error is FinanceQuestionResponseError {
  return error instanceof FinanceQuestionResponseError;
}
