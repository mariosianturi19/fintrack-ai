import { z } from "zod";

import type { TransactionFilters } from "./domain";

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
    );
  });

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseOptionalDate(value: string | string[] | undefined) {
  const result = dateOnlySchema.safeParse(firstValue(value));
  return result.success ? result.data : null;
}

export function parseTransactionFilters(
  parameters: Record<string, string | string[] | undefined>,
): TransactionFilters {
  const categoryResult = z
    .string()
    .uuid()
    .safeParse(firstValue(parameters.category));
  const rawSearch = firstValue(parameters.q)?.trim() ?? "";
  const startDate = parseOptionalDate(parameters.from);
  const endDate = parseOptionalDate(parameters.to);
  const walletResult = z
    .string()
    .uuid()
    .safeParse(firstValue(parameters.wallet));

  return {
    categoryId: categoryResult.success ? categoryResult.data : null,
    endDate: startDate && endDate && endDate < startDate ? null : endDate,
    search: rawSearch.slice(0, 80),
    startDate,
    walletId: walletResult.success ? walletResult.data : null,
  };
}

export function hasTransactionFilters(filters: TransactionFilters) {
  return Boolean(
    filters.categoryId ||
    filters.startDate ||
    filters.endDate ||
    filters.search,
  );
}

export function createTransactionListQuery(
  filters: TransactionFilters,
  page?: number,
) {
  const parameters = new URLSearchParams();

  if (filters.search) parameters.set("q", filters.search);
  if (filters.categoryId) parameters.set("category", filters.categoryId);
  if (filters.startDate) parameters.set("from", filters.startDate);
  if (filters.endDate) parameters.set("to", filters.endDate);
  if (filters.walletId) parameters.set("wallet", filters.walletId);
  if (page && page > 1) parameters.set("page", String(page));

  return parameters.toString();
}

export function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/gu, "\\$&");
}
