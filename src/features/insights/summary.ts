import type { WeeklyComparison, WeeklyInsightFacts } from "./domain";

const similarThreshold = 0.1;

export function getWeeklyComparison(
  totalAmountIdr: number,
  previousTotalAmountIdr: number,
): WeeklyComparison {
  if (previousTotalAmountIdr === 0) {
    return "no_previous_data";
  }

  const change =
    (totalAmountIdr - previousTotalAmountIdr) / previousTotalAmountIdr;

  if (change >= similarThreshold) {
    return "higher";
  }

  if (change <= -similarThreshold) {
    return "lower";
  }

  return "similar";
}

export function getWeeklyComparisonCopy(comparison: WeeklyComparison) {
  switch (comparison) {
    case "higher":
      return "lebih tinggi dari minggu sebelumnya";
    case "lower":
      return "lebih rendah dari minggu sebelumnya";
    case "similar":
      return "relatif stabil dibanding minggu sebelumnya";
    case "no_previous_data":
      return "menjadi dasar perbandingan untuk minggu berikutnya";
  }
}

export function createDeterministicWeeklySummary(facts: WeeklyInsightFacts) {
  const comparison = getWeeklyComparison(
    facts.totalAmountIdr,
    facts.previousTotalAmountIdr,
  );

  return [
    `Pengeluaran paling banyak berada pada kategori ${facts.topCategoryName}.`,
    `Total pengeluaran ${getWeeklyComparisonCopy(comparison)}.`,
  ].join(" ");
}
