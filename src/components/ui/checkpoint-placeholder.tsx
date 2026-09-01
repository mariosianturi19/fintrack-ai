import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";

import { ActionLink } from "./action-link";
import { StatusBadge } from "./status-badge";

type CheckpointPlaceholderProps = Readonly<{
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon: React.ReactNode;
  note: string;
  title: string;
}>;

export function CheckpointPlaceholder({
  actionHref,
  actionLabel,
  description,
  icon,
  note,
  title,
}: CheckpointPlaceholderProps) {
  return (
    <section className="mt-7 grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.4fr)] lg:gap-6">
      <article className="min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7">
        <div className="flex min-w-0 flex-col items-start gap-5 sm:flex-row">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary"
          >
            {icon}
          </span>
          <div className="min-w-0">
            <StatusBadge tone="information">Fondasi route aktif</StatusBadge>
            <h2 className="mt-4 font-display text-[22px] leading-[1.25] font-semibold tracking-[-0.015em] text-ink">
              {title}
            </h2>
            <p className="mt-3 max-w-[680px] font-body text-base leading-7 text-ink-secondary">
              {description}
            </p>
            {actionHref && actionLabel ? (
              <div className="mt-6">
                <ActionLink
                  href={actionHref}
                  icon={<ArrowRight size={18} weight="bold" />}
                  variant="secondary"
                >
                  {actionLabel}
                </ActionLink>
              </div>
            ) : null}
          </div>
        </div>
      </article>

      <aside className="min-w-0 rounded-lg border border-border bg-canvas-subtle p-5 sm:p-6">
        <p className="font-body text-xs font-semibold tracking-[0.14em] text-primary uppercase">
          Batas checkpoint
        </p>
        <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
          {note}
        </p>
      </aside>
    </section>
  );
}
