"use client";

import { House } from "@phosphor-icons/react/House";
import type { Icon } from "@phosphor-icons/react/lib";
import { Receipt } from "@phosphor-icons/react/Receipt";
import { Scan } from "@phosphor-icons/react/Scan";
import { UserCircle } from "@phosphor-icons/react/UserCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  isNavigationItemActive,
  primaryNavigation,
  type NavigationIcon,
} from "@/lib/navigation";

const navigationIcons: Record<NavigationIcon, Icon> = {
  dashboard: House,
  profile: UserCircle,
  scan: Scan,
  transactions: Receipt,
};

type PrimaryNavigationProps = Readonly<{
  variant: "mobile" | "sidebar";
}>;

export function PrimaryNavigation({ variant }: PrimaryNavigationProps) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav
        aria-label="Navigasi utama"
        className="mobile-bottom-navigation fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-divider bg-surface lg:hidden"
      >
        {primaryNavigation.map((item) => {
          const active = isNavigationItemActive(pathname, item.href);
          const NavigationIcon = navigationIcons[item.icon];

          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={[
                "relative flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-1 font-body text-[11px] leading-4 font-medium transition-colors duration-fast",
                active ? "text-primary" : "text-ink-secondary hover:text-ink",
              ].join(" ")}
              href={item.href}
              key={item.href}
            >
              <span
                aria-hidden="true"
                className={[
                  "flex size-9 items-center justify-center rounded-md",
                  active ? "bg-primary-soft" : "bg-transparent",
                ].join(" ")}
              >
                <NavigationIcon
                  size={21}
                  weight={active ? "fill" : "regular"}
                />
              </span>
              <span className="min-w-0">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Navigasi utama" className="mt-8 flex flex-col gap-2">
      {primaryNavigation.map((item) => {
        const active = isNavigationItemActive(pathname, item.href);
        const NavigationIcon = navigationIcons[item.icon];

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={[
              "group relative flex min-h-12 min-w-0 items-center justify-center gap-3 rounded-md px-3 font-body text-[15px] font-medium transition-colors duration-fast xl:justify-start",
              active
                ? "bg-[#172638] text-white"
                : "text-[#AEB8C5] hover:bg-[#132132] hover:text-white",
            ].join(" ")}
            href={item.href}
            key={item.href}
          >
            {active ? (
              <span
                aria-hidden="true"
                className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-signal"
              />
            ) : null}
            <NavigationIcon
              aria-hidden="true"
              className="shrink-0"
              size={21}
              weight={active ? "fill" : "regular"}
            />
            <span className="hidden min-w-0 xl:block">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
