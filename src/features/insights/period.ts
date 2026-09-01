import { getJakartaDateInputValue } from "../transactions/format";

export type CompletedWeek = Readonly<{
  endDate: string;
  endDateExclusive: string;
  startDate: string;
}>;

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function addDays(value: Date, days: number) {
  const nextDate = new Date(value);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toDateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function createPreviousCompletedWeek(date = new Date()): CompletedWeek {
  const today = parseDateOnly(getJakartaDateInputValue(date));
  const isoDay = today.getUTCDay() || 7;
  const currentWeekStart = addDays(today, -(isoDay - 1));
  const previousWeekStart = addDays(currentWeekStart, -7);

  return {
    endDate: toDateOnly(addDays(currentWeekStart, -1)),
    endDateExclusive: toDateOnly(currentWeekStart),
    startDate: toDateOnly(previousWeekStart),
  };
}

export function getWeekEndDate(weekStart: string) {
  return toDateOnly(addDays(parseDateOnly(weekStart), 6));
}
