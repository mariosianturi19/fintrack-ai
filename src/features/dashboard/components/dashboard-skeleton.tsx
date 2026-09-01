export function DashboardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Memuat ringkasan dashboard"
      className="mt-7 min-w-0 animate-pulse"
      role="status"
    >
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-6">
        <div className="min-h-[230px] rounded-xl border border-border bg-surface p-7">
          <div className="h-3 w-36 rounded-xs bg-disabled-bg" />
          <div className="mt-5 h-11 w-56 max-w-full rounded-sm bg-disabled-bg" />
          <div className="mt-5 h-4 w-72 max-w-full rounded-xs bg-disabled-bg" />
        </div>
        <div className="min-h-[230px] rounded-xl bg-primary-soft p-7">
          <div className="h-7 w-32 rounded-sm bg-surface" />
          <div className="mt-5 h-7 w-52 max-w-full rounded-xs bg-surface" />
          <div className="mt-4 h-4 w-full rounded-xs bg-surface" />
        </div>
      </div>
      <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:gap-6">
        <div className="min-h-[430px] rounded-lg border border-border bg-surface p-7" />
        <div className="min-h-[430px] rounded-lg border border-border bg-surface p-6" />
      </div>
      <span className="sr-only">Dashboard sedang dimuat.</span>
    </div>
  );
}
