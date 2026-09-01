import { z } from "zod";

const supabasePublicEnvironmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({ error: "Supabase publishable key belum dikonfigurasi." })
    .min(1, "Supabase publishable key belum dikonfigurasi."),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({ error: "Supabase project URL belum dikonfigurasi." })
    .url("Supabase project URL tidak valid."),
});

export function parseSupabasePublicEnvironment(
  input: Record<string, string | undefined>,
) {
  return supabasePublicEnvironmentSchema.parse(input);
}

export function getSupabasePublicEnvironment() {
  return parseSupabasePublicEnvironment({
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
