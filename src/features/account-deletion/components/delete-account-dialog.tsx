"use client";

import { Trash } from "@phosphor-icons/react/Trash";
import { useRef, useState, type FormEvent } from "react";

import { deletionStatusSchema } from "../domain";

export function DeleteAccountDialog({ email }: Readonly<{ email: string }>) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const requestInFlight = useRef(false);
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setConfirmation("");
    setError(null);
    dialog.current?.showModal();
    cancel.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestInFlight.current) return;
    if (confirmation !== "HAPUS") {
      setError("Ketik HAPUS dengan huruf kapital untuk mengonfirmasi.");
      return;
    }
    requestInFlight.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/account/deletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", confirmation }),
        signal: AbortSignal.timeout(30_000),
      });
      const result = deletionStatusSchema.safeParse(await response.json());
      if (!response.ok || !result.success || result.data.status !== "pending")
        throw new Error("request_failed");
      // Full navigation clears the previous account's Next router cache.
      window.location.replace("/account/deletion");
    } catch {
      setError(
        "Permintaan belum dapat dipastikan. Periksa koneksi lalu coba lagi; permintaan yang sudah diterima tidak akan dibuat dua kali.",
      );
      setPending(false);
      requestInFlight.current = false;
    }
  }

  return (
    <>
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-error bg-surface px-5 font-body text-sm font-semibold text-error hover:bg-error-soft"
        onClick={openDialog}
        ref={trigger}
        type="button"
      >
        <Trash aria-hidden="true" size={18} /> Hapus akun Fintrack AI
      </button>
      <dialog
        aria-describedby="delete-account-description"
        aria-labelledby="delete-account-title"
        className="m-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-[640px] overflow-y-auto rounded-xl border border-error bg-surface p-5 text-ink shadow-level-3 backdrop:bg-ink/60 sm:p-8"
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        onClose={() => trigger.current?.focus()}
        ref={dialog}
      >
        <Trash aria-hidden="true" className="text-error" size={28} />
        <h2
          className="mt-4 font-display text-2xl leading-tight font-semibold"
          id="delete-account-title"
        >
          Hapus akun dan seluruh data?
        </h2>
        <div
          className="mt-4 space-y-3 font-body text-sm leading-6 text-ink-secondary"
          id="delete-account-description"
        >
          <p>
            Akun Fintrack AI untuk{" "}
            <strong className="font-semibold text-ink [overflow-wrap:anywhere]">
              {email}
            </strong>{" "}
            akan dihapus, beserta transaksi, insight, riwayat permintaan AI, dan
            foto struk terkait.
          </p>
          <p>
            Akun Google kamu tidak dihapus. File export yang sudah kamu unduh
            tetap ada di perangkatmu.
          </p>
          <p className="rounded-md bg-error-soft p-4 font-semibold text-error">
            Setelah dikonfirmasi, akun tidak dapat digunakan dan penghapusan
            tidak dapat dibatalkan. Penyelesaian dapat memerlukan beberapa
            menit.
          </p>
        </div>
        <form className="mt-5" onSubmit={submit}>
          <label
            className="block font-body text-sm font-semibold"
            htmlFor="delete-account-confirmation"
          >
            Ketik HAPUS untuk melanjutkan
          </label>
          <input
            aria-describedby={error ? "delete-account-error" : undefined}
            autoComplete="off"
            autoCapitalize="characters"
            className="mt-2 min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 font-body text-base text-ink"
            disabled={pending}
            id="delete-account-confirmation"
            maxLength={10}
            onChange={(event) => setConfirmation(event.target.value)}
            spellCheck={false}
            value={confirmation}
          />
          {error ? (
            <p
              className="mt-3 font-body text-sm leading-6 text-error"
              id="delete-account-error"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              className="min-h-12 flex-1 rounded-md border border-primary px-5 font-body text-sm font-semibold text-primary hover:bg-primary-soft disabled:opacity-60"
              disabled={pending}
              onClick={() => dialog.current?.close()}
              ref={cancel}
              type="button"
            >
              Batal
            </button>
            <button
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-error px-5 py-3 font-body text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending || confirmation !== "HAPUS"}
              type="submit"
            >
              {pending ? "Mengirim permintaan..." : "Hapus akun dan data"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
