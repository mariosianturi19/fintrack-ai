import "server-only";

import { z } from "zod";

const privilegedEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ error: "Supabase project URL belum dikonfigurasi." })
    .url("Supabase project URL tidak valid."),
  SUPABASE_SECRET_KEY: z
    .string({ error: "Supabase secret key belum dikonfigurasi." })
    .min(1, "Supabase secret key belum dikonfigurasi."),
});

export function getSupabasePrivilegedEnvironment() {
  return privilegedEnvironmentSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}
