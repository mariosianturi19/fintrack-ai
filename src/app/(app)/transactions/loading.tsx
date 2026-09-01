export default function TransactionsLoading() {
  return (
    <div aria-busy="true" aria-label="Memuat transaksi" role="status">
      <div className="animate-pulse border-b border-divider pb-6">
        <div className="h-3 w-32 rounded bg-primary-soft" />
        <div className="mt-3 h-9 w-52 rounded bg-disabled-bg" />
        <div className="mt-3 h-5 w-72 max-w-full rounded bg-disabled-bg" />
      </div>
      <div className="mt-6 min-h-[420px] rounded-xl border border-border bg-surface p-5 shadow-level-1">
        <div className="grid gap-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="flex min-h-[64px] items-center gap-4 border-b border-divider pb-4 last:border-0"
              key={index}
            >
              <div className="size-11 shrink-0 rounded-md bg-primary-soft" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-40 max-w-full rounded bg-disabled-bg" />
                <div className="mt-2 h-3 w-28 rounded bg-disabled-bg" />
              </div>
              <div className="h-4 w-24 rounded bg-expense-soft" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Memuat daftar transaksi...</span>
    </div>
  );
}
