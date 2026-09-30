import { z } from "zod";

const monthStartSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-01$/)
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)));

const amountSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.replace(/[.\s]/gu, "") : value),
  z.coerce.number().int().min(1).max(999_999_999_999),
);

export const budgetInputSchema = z.object({
  categoryId: z.string().uuid(),
  limitAmountIdr: amountSchema,
  monthStart: monthStartSchema,
});

export const budgetDeleteSchema = z.object({
  categoryId: z.string().uuid(),
  monthStart: monthStartSchema,
});

export type ParsedBudgetInput = z.infer<typeof budgetInputSchema>;

export function parseBudgetForm(formData: FormData) {
  return budgetInputSchema.safeParse({
    categoryId: formData.get("categoryId"),
    limitAmountIdr: formData.get("limitAmountIdr"),
    monthStart: formData.get("monthStart"),
  });
}

export function parseBudgetDeleteForm(formData: FormData) {
  return budgetDeleteSchema.safeParse({
    categoryId: formData.get("categoryId"),
    monthStart: formData.get("monthStart"),
  });
}
