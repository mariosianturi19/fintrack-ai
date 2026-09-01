import Image from "next/image";
import type { Metadata } from "next";

import { DeletionProgress } from "@/features/account-deletion/components/deletion-progress";

export const metadata: Metadata = {
  title: "Penghapusan akun",
  robots: { index: false, follow: false },
};

export default function AccountDeletionPage() {
  return (
    <main className="flex min-h-svh items-start justify-center bg-canvas px-4 py-8 text-ink sm:px-6 sm:py-16">
      <section className="w-full max-w-[640px] min-w-0">
        <Image
          alt="Fintrack AI"
          className="h-auto w-[176px]"
          height={72}
          priority
          src="/brand/fintrack-ai-lockup-primary.svg"
          width={492}
        />
        <div className="mt-8 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-8">
          <p className="font-body text-xs font-semibold tracking-[0.16em] text-primary uppercase">
            Kontrol privasi
          </p>
          <h1 className="mt-3 font-display text-[28px] leading-tight font-semibold">
            Penghapusan akun
          </h1>
          <DeletionProgress />
        </div>
      </section>
    </main>
  );
}
