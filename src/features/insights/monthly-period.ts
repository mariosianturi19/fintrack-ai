import { getJakartaDateInputValue } from "../transactions/format";

export type CompletedMonth = Readonly<{
  endDate: string;
  endDateExclusive: string;
  startDate: string;
}>;

function addMonths(monthStart: string, months: number) {
  const [year, month] = monthStart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1))
    .toISOString()
    .slice(0, 10);
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function createPreviousCompletedMonth(
  date = new Date(),
): CompletedMonth {
  const currentMonthStart = `${getJakartaDateInputValue(date).slice(0, 7)}-01`;
  const previousMonthStart = addMonths(currentMonthStart, -1);

  return {
    endDate: addDays(currentMonthStart, -1),
    endDateExclusive: currentMonthStart,
    startDate: previousMonthStart,
  };
}

export function getMonthEndDate(monthStart: string) {
  return addDays(addMonths(monthStart, 1), -1);
}
