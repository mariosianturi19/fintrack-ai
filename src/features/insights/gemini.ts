import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { environment } from "@/lib/env/server";

import type { WeeklyInsightFacts } from "./domain";
import { getWeeklyComparison } from "./summary";

const weeklyInsightTimeoutMs = 15_000;
const weeklyInsightOutputSchema = z.object({
  summary: z
    .string()
    .min(1)
    .max(320)
    .refine((value) => !/\d/u.test(value), "Summary must not contain digits."),
});

const weeklyInsightJsonSchema = {
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
  },
  required: ["summary"],
  type: "object",
} as const;

export class WeeklyInsightAiError extends Error {
  constructor(
    public readonly code: "configuration" | "malformed" | "provider",
  ) {
    super(code);
    this.name = "WeeklyInsightAiError";
  }
}

function getProviderStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

export async function generateWeeklyInsightNarrative(
  facts: WeeklyInsightFacts,
) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = environment;

  if (!GEMINI_API_KEY || !GEMINI_MODEL) {
    throw new WeeklyInsightAiError("configuration");
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      config: {
        httpOptions: { timeout: weeklyInsightTimeoutMs },
        maxOutputTokens: 180,
        responseJsonSchema: weeklyInsightJsonSchema,
        responseMimeType: "application/json",
        systemInstruction: [
          "Kamu menulis insight pengeluaran mingguan dalam bahasa Indonesia.",
          "Gunakan satu atau dua kalimat yang tenang, spesifik, dan tidak menghakimi.",
          "Semua angka sudah ditampilkan terpisah oleh aplikasi, jadi jangan tulis digit atau nominal apa pun.",
          "Jangan menambahkan fakta, kategori, penyebab, saran, atau kesimpulan yang tidak tersedia pada data.",
          "Kembalikan hanya JSON sesuai schema.",
        ].join(" "),
      },
      contents: [
        {
          parts: [
            {
              text: JSON.stringify({
                categoryOrder: facts.categoryTotals.map(
                  (category) => category.name,
                ),
                comparison: getWeeklyComparison(
                  facts.totalAmountIdr,
                  facts.previousTotalAmountIdr,
                ),
                topCategoryName: facts.topCategoryName,
              }),
            },
          ],
          role: "user",
        },
      ],
      model: GEMINI_MODEL,
    });

    if (!response.text) {
      throw new WeeklyInsightAiError("malformed");
    }

    let json: unknown;

    try {
      json = JSON.parse(response.text);
    } catch {
      throw new WeeklyInsightAiError("malformed");
    }

    const parsed = weeklyInsightOutputSchema.parse(json);

    return {
      modelName: GEMINI_MODEL,
      summary: parsed.summary.replace(/\s+/g, " ").trim(),
    };
  } catch (error) {
    if (error instanceof WeeklyInsightAiError) {
      throw error;
    }

    console.error("[Fintrack AI] Pembuatan narasi insight gagal.", {
      errorName: error instanceof Error ? error.name : "UnknownError",
      status: getProviderStatus(error),
    });
    throw new WeeklyInsightAiError(
      error instanceof z.ZodError ? "malformed" : "provider",
    );
  }
}
