export type FinanceQuestionContext = Readonly<{
  categories: readonly Readonly<{
    name: string;
    totalAmountIdr: number;
    transactionCount: number;
  }>[];
  days: readonly Readonly<{
    date: string;
    totalAmountIdr: number;
    transactionCount: number;
  }>[];
  merchants: readonly Readonly<{
    merchant: string;
    totalAmountIdr: number;
    transactionCount: number;
  }>[];
  overall: Readonly<{
    totalAmountIdr: number;
    transactionCount: number;
  }>;
  period: Readonly<{ endDate: string; startDate: string }>;
}>;

export type QuestionPeriodOption = Readonly<{
  endDate: string;
  key: "month" | "quarter" | "year";
  label: string;
  startDate: string;
}>;
