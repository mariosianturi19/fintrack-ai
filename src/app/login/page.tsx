import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";
import { LockKey } from "@phosphor-icons/react/dist/ssr/LockKey";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { signInWithGoogle } from "@/app/auth/actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getAccountSession } from "@/lib/auth/session";

const errorMessages: Record<string, string> = {
  callback_failed:
    "Login belum berhasil diselesaikan. Silakan coba lagi melalui tombol Google.",
  oauth_start_failed:
    "Google Sign-In belum dapat dibuka. Periksa koneksi, lalu coba lagi.",
};

export const metadata: Metadata = {
  title: "Masuk atau daftar",
};

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const parameters = await searchParams;
  const next = getSafeRedirectPath(parameters.next);
  const session = await getAccountSession();
  if (session?.access === "deleting") redirect("/account/deletion");
  const account = session?.account;

  if (account) {
    redirect(next);
  }

  const errorMessage = parameters.error
    ? errorMessages[parameters.error]
    : undefined;
  const signedOut = parameters.message === "signed_out";
  const accountDeleted = parameters.message === "account_deleted";

  return (
    <main className="grid min-h-svh bg-canvas text-ink lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
      <section className="relative hidden min-w-0 overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col xl:p-14">
        <Image
          alt="Fintrack AI"
          className="h-auto w-[190px]"
          height={72}
          priority
          src="/brand/fintrack-ai-lockup-reverse.svg"
          width={492}
        />

        <div className="my-auto max-w-[620px]">
          <p className="font-body text-xs font-semibold tracking-[0.18em] text-signal uppercase">
            Precision without anxiety
          </p>
          <h2 className="mt-6 font-display text-[44px] leading-[1.08] font-semibold tracking-[-0.035em] text-white xl:text-[52px]">
            Keuangan lebih jelas. Keputusan terasa lebih tenang.
          </h2>
          <p className="mt-6 max-w-[520px] font-body text-base leading-7 text-[#C9D1DA] xl:text-lg xl:leading-8">
            Catat pengeluaran, periksa hasil scan struk, dan pahami pola belanja
            tanpa dashboard yang terasa rumit.
          </p>
        </div>

        <div className="grid max-w-[620px] gap-4 border-t border-[#2C3C4E] pt-7 sm:grid-cols-2">
          <div className="flex min-w-0 items-start gap-3">
            <CheckCircle
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-signal"
              size={20}
              weight="fill"
            />
            <p className="font-body text-sm leading-6 text-[#C9D1DA]">
              Hasil AI selalu dapat diperiksa dan dikoreksi.
            </p>
          </div>
          <div className="flex min-w-0 items-start gap-3">
            <LockKey
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-signal"
              size={20}
            />
            <p className="font-body text-sm leading-6 text-[#C9D1DA]">
              Sesi dan foto struk dilindungi sebelum diproses.
            </p>
          </div>
        </div>
      </section>

      <section className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[400px] min-w-0">
          <Image
            alt="Fintrack AI"
            className="h-auto w-[176px] lg:hidden"
            height={72}
            priority
            src="/brand/fintrack-ai-lockup-primary.svg"
            width={492}
          />

          <p className="mt-10 font-body text-xs font-semibold tracking-[0.16em] text-primary uppercase lg:hidden">
            Ruang kerja pribadi
          </p>

          <div className="mt-4 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7 lg:mt-0">
            <StatusBadge tone="information">Masuk atau daftar</StatusBadge>
            <h1 className="mt-5 font-display text-[28px] leading-[1.18] font-semibold tracking-[-0.025em] text-ink sm:text-[32px]">
              Selamat datang di Fintrack AI
            </h1>
            <p className="mt-3 font-body text-base leading-7 text-ink-secondary">
              Gunakan akun Google untuk membuka ruang kerja keuanganmu.
            </p>

            {errorMessage ? (
              <div
                aria-live="polite"
                className="mt-6 rounded-md border border-error bg-error-soft p-4"
                role="alert"
              >
                <p className="font-body text-sm font-semibold text-error">
                  Login belum berhasil
                </p>
                <p className="mt-1 font-body text-sm leading-6 text-ink-secondary">
                  {errorMessage}
                </p>
              </div>
            ) : null}

            {signedOut || accountDeleted ? (
              <div
                aria-live="polite"
                className="mt-6 rounded-md bg-signal-soft p-4"
                role="status"
              >
                <p className="font-body text-sm font-semibold text-signal-ink">
                  {accountDeleted
                    ? "Akun Fintrack AI dan data terkait berhasil dihapus. Akun Google kamu tidak dihapus."
                    : "Kamu sudah keluar dengan aman."}
                </p>
              </div>
            ) : null}

            <form action={signInWithGoogle} className="mt-7">
              <input name="next" type="hidden" value={next} />
              <GoogleSignInButton />
            </form>

            <p className="mt-4 flex items-center justify-center gap-2 font-body text-xs text-ink-secondary">
              <span
                aria-hidden="true"
                className="size-2 shrink-0 rounded-full bg-signal"
              />
              <span>Akun baru dibuat otomatis</span>
            </p>

            <p
              className="mt-5 border-t border-divider pt-4 font-body text-xs leading-5 text-ink-warm-muted"
              id="google-sign-in-note"
            >
              Fintrack AI hanya meminta identitas dasar: nama, email, dan
              profil. Tidak ada akses ke Drive, Gmail, atau layanan Google
              lainnya.
            </p>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 font-body text-sm text-ink-secondary">
            <span>Setelah masuk, kamu akan kembali ke halaman tujuan.</span>
            <ArrowRight aria-hidden="true" className="shrink-0" size={17} />
          </p>
        </div>
      </section>
    </main>
  );
}
