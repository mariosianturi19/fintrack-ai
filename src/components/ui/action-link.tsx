import Link from "next/link";

const variantClasses = {
  primary: "bg-primary text-white hover:bg-primary-hover border-transparent",
  secondary:
    "border-primary bg-surface text-primary hover:bg-primary-soft hover:text-primary-hover",
} as const;

type ActionLinkProps = Readonly<{
  children: React.ReactNode;
  href: string;
  icon?: React.ReactNode;
  variant?: keyof typeof variantClasses;
}>;

export function ActionLink({
  children,
  href,
  icon,
  variant = "primary",
}: ActionLinkProps) {
  return (
    <Link
      className={[
        "inline-flex min-h-12 max-w-full min-w-0 items-center justify-center gap-2 rounded-md border px-5 font-body text-[15px] leading-5 font-semibold transition-colors duration-fast",
        variantClasses[variant],
      ].join(" ")}
      href={href}
    >
      {icon ? (
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0">{children}</span>
    </Link>
  );
}
