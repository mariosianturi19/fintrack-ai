"use client";

import { Funnel } from "@phosphor-icons/react/Funnel";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import { X } from "@phosphor-icons/react/X";
import Link from "next/link";
import { useRef } from "react";

import type {
  TransactionCategory,
  TransactionFilters as TransactionFilterValues,
} from "../domain";
import { hasTransactionFilters } from "../filters";

type TransactionFiltersProps = Readonly<{
  categories: readonly TransactionCategory[];
  filters: TransactionFilterValues;
}>;

function FilterFields({ categories, filters }: TransactionFiltersProps) {
  return (
    <>
      <label className="min-w-0 flex-1">
        <span className="font-body text-xs font-semibold text-ink-secondary">
          Cari transaksi
        </span>
        <span className="relative mt-1.5 block">
          <MagnifyingGlass
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-secondary"
            size={18}
          />
          <input
            className="min-h-12 w-full rounded-md border border-border bg-surface py-2 pr-3 pl-10 font-body text-sm text-ink placeholder:text-ink-warm-muted"
            defaultValue={filters.search}
            maxLength={80}
            name="q"
            placeholder="Merchant atau catatan"
            type="search"
          />
        </span>
      </label>

      <label className="min-w-0 md:w-[210px]">
        <span className="font-body text-xs font-semibold text-ink-secondary">
          Kategori
        </span>
        <select
          className="mt-1.5 min-h-12 w-full rounded-md border border-border bg-surface px-3 font-body text-sm text-ink"
          defaultValue={filters.categoryId ?? ""}
          name="category"
        >
          <option value="">Semua kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-0 md:w-[168px]">
        <span className="font-body text-xs font-semibold text-ink-secondary">
          Dari tanggal
        </span>
        <input
          className="mt-1.5 min-h-12 w-full rounded-md border border-border bg-surface px-3 font-body text-sm text-ink"
          defaultValue={filters.startDate ?? ""}
          name="from"
          type="date"
        />
      </label>

      <label className="min-w-0 md:w-[168px]">
        <span className="font-body text-xs font-semibold text-ink-secondary">
          Sampai tanggal
        </span>
        <input
          className="mt-1.5 min-h-12 w-full rounded-md border border-border bg-surface px-3 font-body text-sm text-ink"
          defaultValue={filters.endDate ?? ""}
          min={filters.startDate ?? undefined}
          name="to"
          type="date"
        />
      </label>
    </>
  );
}

function FilterActions({ active }: Readonly<{ active: boolean }>) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3">
      <button
        className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        type="submit"
      >
        Terapkan
      </button>
      {active ? (
        <Link
          className="inline-flex min-h-11 items-center justify-center px-2 font-body text-sm font-semibold text-primary underline-offset-4 hover:underline"
          href="/transactions"
        >
          Reset filter
        </Link>
      ) : null}
    </div>
  );
}

export function TransactionFilters({
  categories,
  filters,
}: TransactionFiltersProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const active = hasTransactionFilters(filters);
  const activeCount = [
    filters.search,
    filters.categoryId,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <section aria-label="Filter transaksi" className="mt-6 min-w-0">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary bg-surface px-4 font-body text-sm font-semibold text-primary"
          onClick={() => dialogRef.current?.showModal()}
          type="button"
        >
          <Funnel aria-hidden="true" size={18} weight="bold" />
          Filter dan cari
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-primary">
              {activeCount}
            </span>
          ) : null}
        </button>
        {active ? (
          <Link
            className="font-body text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href="/transactions"
          >
            Reset
          </Link>
        ) : null}
      </div>

      <form
        action="/transactions"
        className="hidden min-w-0 items-end gap-3 rounded-lg border border-border bg-surface p-4 shadow-level-1 md:flex md:flex-wrap"
        method="get"
      >
        <FilterFields categories={categories} filters={filters} />
        <FilterActions active={active} />
      </form>

      <dialog
        className="m-0 mt-auto max-h-[88dvh] w-full max-w-none rounded-t-xl border border-border bg-surface p-0 text-ink shadow-level-3 backdrop:bg-ink/45 md:hidden"
        ref={dialogRef}
      >
        <form
          action="/transactions"
          className="min-w-0 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          method="get"
        >
          <div className="flex items-center justify-between gap-4 border-b border-divider pb-4">
            <div>
              <p className="font-display text-xl font-semibold text-ink">
                Filter transaksi
              </p>
              <p className="mt-1 font-body text-sm text-ink-secondary">
                Persempit daftar tanpa mengubah data tersimpan.
              </p>
            </div>
            <button
              aria-label="Tutup filter"
              className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-primary"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <div className="mt-5 grid min-w-0 gap-4">
            <FilterFields categories={categories} filters={filters} />
          </div>
          <div className="mt-6 border-t border-divider pt-5">
            <FilterActions active={active} />
          </div>
        </form>
      </dialog>
    </section>
  );
}
