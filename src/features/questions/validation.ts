import { z } from "zod";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
    );
  });

export const financeQuestionRequestSchema = z
  .object({
    endDate: dateSchema,
    question: z.string().trim().min(3).max(300),
    requestId: z.string().uuid(),
    startDate: dateSchema,
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "Invalid period",
    path: ["endDate"],
  })
  .refine(
    (value) => {
      const start = new Date(`${value.startDate}T00:00:00.000Z`);
      const end = new Date(`${value.endDate}T00:00:00.000Z`);
      return end.getTime() - start.getTime() <= 365 * 86_400_000;
    },
    { message: "Period is too long", path: ["endDate"] },
  );
