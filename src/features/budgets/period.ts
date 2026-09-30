const jakartaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  timeZone: "Asia/Jakarta",
  year: "numeric",
});

export function createBudgetMonth(date = new Date()) {
  const parts = Object.fromEntries(
    jakartaDateFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const monthStart = `${parts.year}-${parts.month}-01`;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthEnd = `${parts.year}-${parts.month}-${String(lastDay).padStart(2, "0")}`;

  return {
    monthEnd,
    monthLabel: monthLabelFormatter.format(
      new Date(`${monthStart}T12:00:00+07:00`),
    ),
    monthStart,
  } as const;
}
