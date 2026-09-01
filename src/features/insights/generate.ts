import "server-only";

import {
  claimWeeklyInsight,
  listWeeklyInsightCandidates,
  updateWeeklyInsightNarrative,
  WeeklyInsightDataError,
} from "./data";
import { generateWeeklyInsightNarrative } from "./gemini";
import { createPreviousCompletedWeek } from "./period";
import { createDeterministicWeeklySummary } from "./summary";

const maximumUsersPerRun = 10;

export type WeeklyInsightRunResult = Readonly<{
  aiGeneratedCount: number;
  candidateCount: number;
  createdCount: number;
  fallbackCount: number;
  skippedCount: number;
  weekEnd: string;
  weekStart: string;
}>;

export async function generatePreviousWeekInsights(
  date = new Date(),
): Promise<WeeklyInsightRunResult> {
  const week = createPreviousCompletedWeek(date);
  const candidates = await listWeeklyInsightCandidates(week.startDate);

  if (candidates.length > maximumUsersPerRun) {
    throw new WeeklyInsightDataError("candidate_limit");
  }

  let aiGeneratedCount = 0;
  let createdCount = 0;
  let fallbackCount = 0;
  let skippedCount = 0;

  for (const candidate of candidates) {
    const fallbackSummary = createDeterministicWeeklySummary(candidate);
    const insightId = await claimWeeklyInsight(candidate, fallbackSummary);

    if (!insightId) {
      skippedCount += 1;
      continue;
    }

    createdCount += 1;

    try {
      const generated = await generateWeeklyInsightNarrative(candidate);
      const stored = await updateWeeklyInsightNarrative(
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
      if (error instanceof WeeklyInsightDataError) {
        throw error;
      }

      fallbackCount += 1;
    }
  }

  return {
    aiGeneratedCount,
    candidateCount: candidates.length,
    createdCount,
    fallbackCount,
    skippedCount,
    weekEnd: week.endDate,
    weekStart: week.startDate,
  };
}
