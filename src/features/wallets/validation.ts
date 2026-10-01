import { z } from "zod";

import { WALLET_TYPES } from "./domain";

export const walletIdSchema = z.string().uuid("Identitas dompet tidak valid.");

export const walletNameSchema = z
  .string()
  .trim()
  .min(1, "Masukkan nama dompet.")
  .max(48, "Nama dompet maksimal 48 karakter.");

export const walletTypeSchema = z.enum(WALLET_TYPES, {
  error: "Pilih jenis dompet.",
});

export const walletFormSchema = z.object({
  name: walletNameSchema,
  walletType: walletTypeSchema,
});

export const walletMutationSchema = z.object({
  walletId: walletIdSchema,
});

export function firstParameterValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseRequestedWalletId(
  value: string | string[] | undefined,
): string | null {
  const parsed = walletIdSchema.safeParse(firstParameterValue(value));
  return parsed.success ? parsed.data : null;
}
