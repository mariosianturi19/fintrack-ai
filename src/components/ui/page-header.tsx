type PageHeaderProps = Readonly<{
  action?: React.ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}>;

export function PageHeader({
  action,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="flex min-w-0 flex-col gap-5 border-b border-divider pb-6 sm:flex-row sm:items-end sm:justify-between lg:pb-7">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 font-body text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[28px] leading-[1.2] font-semibold tracking-[-0.025em] text-ink lg:text-[32px]">
          {title}
        </h1>
        <p className="mt-1 max-w-[720px] font-body text-sm leading-6 text-ink-secondary sm:text-base">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
