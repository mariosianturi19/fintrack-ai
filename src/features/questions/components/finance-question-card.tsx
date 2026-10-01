"use client";

import { ArrowRight } from "@phosphor-icons/react/ArrowRight";
import { ChatCircleDots } from "@phosphor-icons/react/ChatCircleDots";
import { useState } from "react";

import type { QuestionPeriodOption } from "../domain";

type AnswerState =
  | Readonly<{ status: "idle" }>
  | Readonly<{ status: "loading" }>
  | Readonly<{ answer: string; status: "ready" }>
  | Readonly<{ message: string; status: "error" }>;

export function FinanceQuestionCard({
  periods,
  scopeLabel,
  walletId,
}: Readonly<{
  periods: readonly QuestionPeriodOption[];
  scopeLabel: string;
  walletId: string | null;
}>) {
  const [question, setQuestion] = useState("");
  const [periodKey, setPeriodKey] = useState(periods[0]?.key ?? "month");
  const [answer, setAnswer] = useState<AnswerState>({ status: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const period = periods.find((item) => item.key === periodKey);
    const normalizedQuestion = question.trim();
    if (!period || normalizedQuestion.length < 3) {
      setAnswer({
        message: "Tulis pertanyaan sedikit lebih lengkap.",
        status: "error",
      });
      return;
    }

    setAnswer({ status: "loading" });
    try {
      const response = await fetch("/api/questions", {
        body: JSON.stringify({
          endDate: period.endDate,
          question: normalizedQuestion,
          requestId: crypto.randomUUID(),
          startDate: period.startDate,
          walletId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const payload = (await response.json()) as {
        answer?: unknown;
        message?: unknown;
      };
      if (!response.ok || typeof payload.answer !== "string") {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : "Jawaban belum dapat dibuat.",
        );
      }
      setAnswer({ answer: payload.answer, status: "ready" });
    } catch (error) {
      setAnswer({
        message:
          error instanceof Error
            ? error.message
            : "Jawaban belum dapat dibuat. Coba lagi nanti.",
        status: "error",
      });
    }
  }

  return (
    <section
      aria-labelledby="finance-question-title"
      className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"
        >
          <ChatCircleDots size={23} />
        </span>
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold tracking-[0.14em] text-ink-secondary uppercase">
            Tanya data pengeluaran
          </p>
          <h2
            className="mt-1 font-display text-[22px] leading-7 font-semibold text-ink"
            id="finance-question-title"
          >
            Apa yang ingin kamu pahami?
          </h2>
          <p className="mt-2 max-w-[720px] font-body text-sm leading-6 text-ink-secondary">
            Contoh: “Berapa pengeluaran makan bulan ini?” atau “Kategori apa
            yang paling besar?” Jawaban menggunakan ruang {scopeLabel}.
          </p>
        </div>
      </div>

      <form className="mt-6 min-w-0" onSubmit={handleSubmit}>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
          <label className="min-w-0">
            <span className="font-body text-sm font-semibold text-ink">
              Pertanyaan
            </span>
            <textarea
              className="mt-2 min-h-28 w-full resize-y rounded-md border border-border bg-surface px-4 py-3 font-body text-sm leading-6 text-ink placeholder:text-ink-warm-muted"
              maxLength={300}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Tanyakan pola dari transaksi milikmu..."
              value={question}
            />
          </label>
          <label className="min-w-0">
            <span className="font-body text-sm font-semibold text-ink">
              Periode data
            </span>
            <select
              className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-3 font-body text-sm text-ink"
              onChange={(event) =>
                setPeriodKey(event.target.value as "month" | "quarter" | "year")
              }
              value={periodKey}
            >
              {periods.map((period) => (
                <option key={period.key} value={period.key}>
                  {period.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[700px] font-body text-xs leading-5 text-ink-secondary">
            Pertanyaan dan ringkasan agregat periode diproses oleh Gemini.
            Catatan, item struk, dan foto tidak disertakan.
          </p>
          <button
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-sm font-semibold text-white hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-ink"
            disabled={answer.status === "loading"}
            type="submit"
          >
            {answer.status === "loading" ? "Menyusun jawaban..." : "Tanyakan"}
            {answer.status !== "loading" ? (
              <ArrowRight aria-hidden="true" size={17} weight="bold" />
            ) : null}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-5">
        {answer.status === "ready" ? (
          <div className="rounded-lg border-l-[3px] border-primary bg-primary-soft p-5">
            <p className="font-body text-xs font-semibold tracking-[0.12em] text-primary uppercase">
              Jawaban berdasarkan data
            </p>
            <p className="mt-2 font-body text-base leading-7 text-ink">
              {answer.answer}
            </p>
          </div>
        ) : null}
        {answer.status === "error" ? (
          <p
            className="rounded-md border border-error bg-error-soft p-4 font-body text-sm text-error"
            role="alert"
          >
            {answer.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
