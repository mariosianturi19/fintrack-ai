const toneClasses = {
  information: "bg-primary-soft text-primary",
  neutral: "border border-border bg-surface text-ink-secondary",
  success: "bg-signal-soft text-signal-ink",
  warning: "bg-warning-soft text-warning-ink",
} as const;

type StatusBadgeProps = Readonly<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  tone?: keyof typeof toneClasses;
}>;

export function StatusBadge({
  children,
  icon,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={[
        "ft-status-badge max-w-full gap-1.5 rounded-sm font-body text-xs leading-4 font-semibold",
        toneClasses[tone],
      ].join(" ")}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">{children}</span>
    </span>
  );
}
