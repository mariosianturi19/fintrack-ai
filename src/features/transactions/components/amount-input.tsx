"use client";

import { useState } from "react";

const formatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 12);
}

function formatDigits(value: string) {
  return value.length > 0 ? formatter.format(Number(value)) : "";
}

type AmountInputProps = Readonly<{
  defaultValue: string;
  describedBy?: string;
  hasError: boolean;
}>;

export function AmountInput({
  defaultValue,
  describedBy,
  hasError,
}: AmountInputProps) {
  const [digits, setDigits] = useState(() => normalizeDigits(defaultValue));

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-body text-sm font-medium text-ink-secondary"
      >
        Rp
      </span>
      <input
        aria-describedby={describedBy}
        aria-invalid={hasError}
        autoComplete="off"
        className={[
          "numeric min-h-12 w-full min-w-0 rounded-md border bg-surface py-3 pr-4 pl-11 font-body text-base text-ink outline-none transition-colors",
          hasError
            ? "border-error focus:border-error"
            : "border-border focus:border-primary",
        ].join(" ")}
        id="amountIdr"
        inputMode="numeric"
        name="amountIdr"
        onChange={(event) => setDigits(normalizeDigits(event.target.value))}
        placeholder="0"
        required
        value={formatDigits(digits)}
      />
    </div>
  );
}
