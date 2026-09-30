import "server-only";

import {
  claimMonthlyInsight,
  listMonthlyInsightCandidates,
  MonthlyInsightDataError,
  updateMonthlyInsightNarrative,
} from "./monthly-data";
import { generateMonthlyInsightNarrative } from "./monthly-gemini";
import { createPreviousCompletedMonth } from "./monthly-period";
import { createDeterministicMonthlySummary } from "./monthly-summary";

const maximumUsersPerRun = 10;

export type MonthlyInsightRunResult = Readonly<{
  aiGeneratedCount: number;
  candidateCount: number;
  createdCount: number;
  fallbackCount: number;
  monthEnd: string;
  monthStart: string;
  skippedCount: number;
}>;

export async function generatePreviousMonthInsights(
  date = new Date(),
): Promise<MonthlyInsightRunResult> {
  const month = createPreviousCompletedMonth(date);
  const candidates = await listMonthlyInsightCandidates(month.startDate);
  if (candidates.length > maximumUsersPerRun) {
    throw new MonthlyInsightDataError("candidate_limit");
  }

  let aiGeneratedCount = 0;
  let createdCount = 0;
  let fallbackCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    const fallback = createDeterministicMonthlySummary(candidate);
    const insightId = await claimMonthlyInsight(candidate, fallback);
    if (!insightId) {
      skippedCount += 1;
      continue;
    }
    createdCount += 1;

    try {
      const generated = await generateMonthlyInsightNarrative(candidate);
      const stored = await updateMonthlyInsightNarrative(
        insightId,
        generated.summary,
        generated.modelName,
      );
      if (stored) aiGeneratedCount += 1;
      else {
        createdCount -= 1;
        skippedCount += 1;
      }
    } catch (error) {
      if (error instanceof MonthlyInsightDataError) throw error;
      fallbackCount += 1;
    }
  }

  return {
    aiGeneratedCount,
    candidateCount: candidates.length,
    createdCount,
    fallbackCount,
    monthEnd: month.endDate,
    monthStart: month.startDate,
    skippedCount,
  };
}
