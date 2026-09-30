import "server-only";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { environment } from "@/lib/env/server";

import type { MonthlyInsightFacts } from "./monthly-domain";
import { getMonthlyComparison } from "./monthly-summary";

const outputSchema = z.object({
  summary: z
    .string()
    .min(1)
    .max(420)
    .refine((value) => !/\d/u.test(value), "Summary must not contain digits."),
});

const responseJsonSchema = {
  additionalProperties: false,
  properties: { summary: { type: "string" } },
  required: ["summary"],
  type: "object",
} as const;

export async function generateMonthlyInsightNarrative(
  facts: MonthlyInsightFacts,
) {
  const { GEMINI_API_KEY, GEMINI_MODEL } = environment;
  if (!GEMINI_API_KEY || !GEMINI_MODEL) throw new Error("configuration");

  const response = await new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
  }).models.generateContent({
    config: {
      httpOptions: { timeout: 15_000 },
      maxOutputTokens: 220,
      responseJsonSchema,
      responseMimeType: "application/json",
      systemInstruction: [
        "Kamu menulis insight pengeluaran bulanan dalam bahasa Indonesia.",
        "Gunakan dua atau tiga kalimat yang tenang, spesifik, dan tidak menghakimi.",
        "Semua angka ditampilkan oleh aplikasi, jadi jangan tulis digit atau nominal.",
        "Gunakan hanya kategori, urutan kategori, pola perbandingan, dan hari puncak yang diberikan.",
        "Jangan mengarang penyebab, saran finansial, atau fakta lain.",
        "Kembalikan hanya JSON sesuai schema.",
      ].join(" "),
    },
    contents: [
      {
        parts: [
          {
            text: JSON.stringify({
              categoryOrder: facts.categoryTotals.map((row) => row.name),
              comparison: getMonthlyComparison(
                facts.totalAmountIdr,
                facts.previousTotalAmountIdr,
              ),
              peakSpendingDate: facts.peakSpendingDate,
              topCategoryName: facts.topCategoryName,
            }),
          },
        ],
        role: "user",
      },
    ],
    model: GEMINI_MODEL,
  });

  if (!response.text) throw new Error("malformed");
  const parsed = outputSchema.parse(JSON.parse(response.text));
  return {
    modelName: GEMINI_MODEL,
    summary: parsed.summary.replace(/\s+/gu, " ").trim(),
  };
}
