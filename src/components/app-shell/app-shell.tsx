import Image from "next/image";
import Link from "next/link";

import type { AccountSummary } from "@/lib/auth/account";

import { NetworkStatusBanner } from "./network-status-banner";
import { PrimaryNavigation } from "./primary-navigation";

type AppShellProps = Readonly<{
  account: AccountSummary;
  children: React.ReactNode;
}>;

export function AppShell({ account, children }: AppShellProps) {
  return (
    <div className="min-h-svh bg-canvas text-ink lg:grid lg:grid-cols-[72px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-primary px-4 py-3 font-body text-sm font-semibold text-white shadow-level-2 transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Lewati ke konten utama
      </a>

      <aside className="sticky top-0 hidden h-svh min-w-0 flex-col bg-ink px-3 py-6 lg:flex xl:px-5">
        <Link
          aria-label="Fintrack AI — Dashboard"
          className="flex min-h-12 items-center justify-center rounded-md xl:justify-start"
          href="/"
        >
          <Image
            alt=""
            aria-hidden="true"
            className="hidden h-auto w-[166px] xl:block"
            height={72}
            priority
            src="/brand/fintrack-ai-lockup-reverse.svg"
            width={492}
          />
          <Image
            alt=""
            aria-hidden="true"
            className="h-8 w-8 xl:hidden"
            height={32}
            priority
            src="/brand/fintrack-ai-mark-reverse.svg"
            width={32}
          />
        </Link>

        <p className="mt-2 hidden px-2 font-body text-[11px] font-semibold tracking-[0.2em] text-[#AEB8C5] uppercase xl:block">
          Personal finance
        </p>

        <PrimaryNavigation variant="sidebar" />

        <Link
          aria-label="Buka profil akun personal"
          className="mt-auto flex min-h-14 min-w-0 items-center justify-center gap-3 rounded-md border border-[#2C3C4E] bg-[#101C2A] p-2 text-white transition-colors duration-fast hover:bg-[#172638] xl:justify-start xl:p-3"
          href="/profile"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-body text-xs font-semibold text-white">
            {account.initials}
          </span>
          <span className="hidden min-w-0 xl:block">
            <span className="block truncate font-body text-sm font-semibold">
              {account.displayName}
            </span>
            <span className="mt-0.5 block truncate font-body text-xs text-[#AEB8C5]">
              {account.email}
            </span>
          </span>
        </Link>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-divider bg-canvas px-4 lg:hidden">
          <Link aria-label="Fintrack AI — Dashboard" href="/">
            <Image
              alt=""
              aria-hidden="true"
              className="h-auto w-[164px]"
              height={72}
              priority
              src="/brand/fintrack-ai-lockup-primary.svg"
              width={492}
            />
          </Link>
          <Link
            aria-label="Buka profil akun personal"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft font-body text-xs font-semibold text-primary"
            href="/profile"
          >
            {account.initials}
          </Link>
        </header>

        <NetworkStatusBanner />

        <main
          className="mx-auto min-h-[calc(100svh-72px)] max-w-[1440px] min-w-0 px-4 pt-7 pb-[calc(6rem+env(safe-area-inset-bottom))] focus:outline-none sm:px-6 sm:pt-8 lg:min-h-svh lg:px-6 lg:pt-8 lg:pb-10 xl:px-8 min-[1440px]:px-10"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <PrimaryNavigation variant="mobile" />
    </div>
  );
}
