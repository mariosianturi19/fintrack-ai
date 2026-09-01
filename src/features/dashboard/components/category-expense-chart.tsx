"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatIdr } from "@/features/transactions/format";

import type { DashboardCategoryBreakdown } from "../domain";

const DESKTOP_CHART_MEDIA_QUERY = "(min-width: 768px)";

function subscribeToDesktopChart(listener: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_CHART_MEDIA_QUERY);
  mediaQuery.addEventListener("change", listener);

  return () => mediaQuery.removeEventListener("change", listener);
}

function getDesktopChartSnapshot() {
  return window.matchMedia(DESKTOP_CHART_MEDIA_QUERY).matches;
}

function getServerDesktopChartSnapshot() {
  return false;
}

type CategoryExpenseChartProps = Readonly<{
  categories: readonly DashboardCategoryBreakdown[];
  periodLabel: string;
  totalAmountIdr: number;
}>;

function ChartTooltip({
  active,
  payload,
}: Readonly<{
  active?: boolean;
  payload?: readonly {
    payload?: DashboardCategoryBreakdown;
    value?: number | string;
  }[];
}>) {
  const item = payload?.[0];

  if (!active || !item?.payload) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 shadow-level-2">
      <p className="font-body text-xs font-semibold text-ink">
        {item.payload.name}
      </p>
      <p className="numeric mt-1 font-body text-xs text-ink-secondary">
        {formatIdr(Number(item.value ?? 0))} · {item.payload.percentage}%
      </p>
    </div>
  );
}

export function CategoryExpenseChart({
  categories,
  periodLabel,
  totalAmountIdr,
}: CategoryExpenseChartProps) {
  const shouldRenderDesktopChart = useSyncExternalStore(
    subscribeToDesktopChart,
    getDesktopChartSnapshot,
    getServerDesktopChartSnapshot,
  );
  const largestCategory = categories[0];

  if (!largestCategory) {
    return null;
  }

  return (
    <>
      <p className="mt-1 font-body text-sm leading-6 text-ink-secondary">
        {periodLabel} · {categories.length} kategori
      </p>

      <div className="mt-6 space-y-5 md:hidden">
        {categories.map((category) => (
          <div className="min-w-0" key={category.id}>
            <div className="flex min-w-0 items-baseline justify-between gap-4">
              <span className="min-w-0 font-body text-sm font-medium text-ink">
                {category.name}
              </span>
              <span className="numeric shrink-0 font-body text-sm font-semibold text-ink">
                {formatIdr(category.amountIdr)}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="mt-2 h-2 overflow-hidden rounded-xs bg-disabled-bg"
            >
              <div
                className="h-full rounded-xs"
                style={{
                  backgroundColor: category.colorHex,
                  width: `${Math.max(category.percentage, 2)}%`,
                }}
              />
            </div>
            <p className="mt-1 font-body text-xs text-ink-secondary">
              {category.percentage}% dari total periode
            </p>
          </div>
        ))}
      </div>

      {shouldRenderDesktopChart ? (
        <div
          aria-label={`Grafik pengeluaran ${periodLabel}. ${largestCategory.name} merupakan kategori terbesar sebesar ${formatIdr(largestCategory.amountIdr)}, atau ${largestCategory.percentage}% dari total ${formatIdr(totalAmountIdr)}.`}
          className="mt-6 h-[340px] min-w-0"
          role="img"
        >
          <ResponsiveContainer
            height="100%"
            minHeight={1}
            minWidth={1}
            width="100%"
          >
            <BarChart
              data={categories}
              layout="vertical"
              margin={{ bottom: 4, left: 0, right: 82, top: 4 }}
            >
              <XAxis domain={[0, "dataMax"]} hide type="number" />
              <YAxis
                axisLine={false}
                dataKey="name"
                tick={{ fill: "#0B1220", fontSize: 13, fontWeight: 500 }}
                tickLine={false}
                type="category"
                width={126}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "#FCFBF7" }}
              />
              <Bar dataKey="amountIdr" maxBarSize={9} radius={[0, 4, 4, 0]}>
                {categories.map((category) => (
                  <Cell fill={category.colorHex} key={category.id} />
                ))}
                <LabelList
                  dataKey="amountIdr"
                  fill="#0B1220"
                  fontSize={12}
                  fontWeight={600}
                  formatter={(value: unknown) => formatIdr(Number(value))}
                  position="right"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      <p className="mt-6 rounded-md bg-canvas-subtle px-4 py-3 font-body text-sm leading-6 text-ink-secondary">
        <span className="font-semibold text-ink">Kategori terbesar:</span>{" "}
        {largestCategory.name} mencakup {largestCategory.percentage}% dari
        pengeluaran {periodLabel}.
      </p>
    </>
  );
}
