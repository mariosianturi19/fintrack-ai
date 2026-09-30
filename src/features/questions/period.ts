import { getJakartaDateInputValue } from "@/features/transactions/format";

import type { QuestionPeriodOption } from "./domain";

function addMonths(date: string, months: number) {
  const [year, month] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1))
    .toISOString()
    .slice(0, 10);
}

export function createQuestionPeriodOptions(
  date = new Date(),
): readonly QuestionPeriodOption[] {
  const today = getJakartaDateInputValue(date);
  const monthStart = `${today.slice(0, 7)}-01`;

  return [
    {
      endDate: today,
      key: "month",
      label: "Bulan ini",
      startDate: monthStart,
    },
    {
      endDate: today,
      key: "quarter",
      label: "3 bulan terakhir",
      startDate: addMonths(monthStart, -2),
    },
    {
      endDate: today,
      key: "year",
      label: "12 bulan terakhir",
      startDate: addMonths(monthStart, -11),
    },
  ];
}
