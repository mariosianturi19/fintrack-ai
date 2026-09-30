import type { MonthlyComparison, MonthlyInsightFacts } from "./monthly-domain";

const similarThreshold = 0.1;

export function getMonthlyComparison(
  totalAmountIdr: number,
  previousTotalAmountIdr: number,
): MonthlyComparison {
  if (previousTotalAmountIdr === 0) return "no_previous_data";
  const change =
    (totalAmountIdr - previousTotalAmountIdr) / previousTotalAmountIdr;
  if (change >= similarThreshold) return "higher";
  if (change <= -similarThreshold) return "lower";
  return "similar";
}

function comparisonCopy(comparison: MonthlyComparison) {
  switch (comparison) {
    case "higher":
      return "lebih tinggi dari bulan sebelumnya";
    case "lower":
      return "lebih rendah dari bulan sebelumnya";
    case "similar":
      return "relatif stabil dibanding bulan sebelumnya";
    case "no_previous_data":
      return "menjadi dasar perbandingan untuk bulan berikutnya";
  }
}

export function createDeterministicMonthlySummary(facts: MonthlyInsightFacts) {
  return [
    `Kategori ${facts.topCategoryName} memiliki porsi pengeluaran terbesar.`,
    `Total pengeluaran ${comparisonCopy(
      getMonthlyComparison(facts.totalAmountIdr, facts.previousTotalAmountIdr),
    )}.`,
  ].join(" ");
}
