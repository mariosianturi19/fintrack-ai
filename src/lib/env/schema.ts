import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const optionalCronSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(16).optional(),
);

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const baseEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    (value) =>
      value === "" || value === undefined ? "http://localhost:3000" : value,
    z.string().url(),
  ),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  R2_ACCOUNT_ID: optionalString,
  R2_ENDPOINT: optionalUrl,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: optionalString,
  CRON_SECRET: optionalCronSecret,
  SUPABASE_SECRET_KEY: optionalString,
});

const configurationGroups = [
  {
    label: "Supabase public",
    keys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ] as const,
  },
  {
    label: "Cloudflare R2",
    keys: [
      "R2_ACCOUNT_ID",
      "R2_ENDPOINT",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME",
    ] as const,
  },
  {
    label: "Google Gemini",
    keys: ["GEMINI_API_KEY", "GEMINI_MODEL"] as const,
  },
] as const;

export const environmentSchema = baseEnvironmentSchema.superRefine(
  (environment, context) => {
    for (const group of configurationGroups) {
      const configuredKeys = group.keys.filter((key) =>
        Boolean(environment[key]),
      );

      if (
        configuredKeys.length > 0 &&
        configuredKeys.length < group.keys.length
      ) {
        const missingKeys = group.keys.filter((key) => !environment[key]);

        for (const missingKey of missingKeys) {
          context.addIssue({
            code: "custom",
            message: `${group.label} configuration is incomplete.`,
            path: [missingKey],
          });
        }
      }
    }
  },
);

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(
  input: Record<string, string | undefined>,
): Environment {
  return environmentSchema.parse(input);
}
