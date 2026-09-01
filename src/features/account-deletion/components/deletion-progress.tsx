"use client";

import { ArrowClockwise } from "@phosphor-icons/react/ArrowClockwise";
import { useCallback, useEffect, useRef, useState } from "react";

import { deletionStatusSchema, type DeletionStatus } from "../domain";

export function DeletionProgress() {
  const [status, setStatus] = useState<DeletionStatus | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const check = useCallback(async (method: "GET" | "POST") => {
    controller.current?.abort();
    const requestController = new AbortController();
    controller.current = requestController;
    try {
      const response = await fetch("/api/account/deletion", {
        method,
        cache: "no-store",
        ...(method === "POST"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "retry" }),
            }
          : {}),
        signal: AbortSignal.any([
          requestController.signal,
          AbortSignal.timeout(55_000),
        ]),
      });
      if (response.status === 401) {
        setError(
          "Sesi pemeriksaan sudah berakhir. Login kembali untuk memeriksa akun. Jangan anggap penghapusan selesai hanya karena sesi berakhir.",
        );
        return;
      }
      const result = deletionStatusSchema.safeParse(await response.json());
      if (!response.ok || !result.success) throw new Error("unavailable");
      if (result.data.status === "active") {
        window.location.replace("/profile");
        return;
      }
      if (result.data.status === "complete" && method === "POST") {
        window.location.replace("/login?message=account_deleted");
        return;
      }
      setStatus(result.data);
    } catch {
      if (!requestController.signal.aborted)
        setError(
          "Status belum dapat dipastikan. Periksa koneksi lalu coba lagi. Permintaan yang sudah diterima tetap tersimpan.",
        );
    } finally {
      if (!requestController.signal.aborted) setBusy(false);
    }
  }, []);

  useEffect(() => {
    // Schedule the first poll so Strict Mode can cancel a discarded mount
    // before starting a request. Subsequent polls use the same timer lifecycle.
    const timer = window.setTimeout(() => {
      void check("GET");
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.current?.abort();
    };
  }, [check]);

  useEffect(() => {
    if (
      busy ||
      error ||
      !status ||
      (status.status === "pending" && status.retryNeeded)
    )
      return;
    const delay =
      status.status === "pending"
        ? Math.max(5, status.retryAfterSeconds) * 1000
        : 0;
    const timer = window.setTimeout(() => {
      setBusy(true);
      setError(null);
      void check("POST");
    }, delay);
    return () => window.clearTimeout(timer);
  }, [busy, check, error, status]);

  const retryNeeded =
    error || (status?.status === "pending" && status.retryNeeded);
  return (
    <div className="mt-6 min-w-0 font-body">
      <div
        aria-atomic="true"
        aria-live="polite"
        className="rounded-lg bg-primary-soft p-4 text-primary"
        role="status"
      >
        <p className="text-sm font-semibold">
          {busy
            ? "Memeriksa penghapusan..."
            : retryNeeded
              ? "Penghapusan belum selesai"
              : "Permintaan penghapusan sedang diproses"}
        </p>
        <p className="mt-2 text-sm leading-6">
          {status?.status === "pending" && status.retryAfterSeconds > 30
            ? "Menunggu upload yang sebelumnya diterbitkan berhenti, lalu membersihkan foto dan data akun. Halaman ini akan melanjutkan secara otomatis."
            : "Kami memeriksa foto privat, akun, dan data terkait sebelum menyatakan selesai."}
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-ink-secondary">
        Akun tidak dapat digunakan selama proses ini. Menutup halaman tidak
        membatalkan permintaan. Jika layanan bermasalah, pembersihan dapat
        dicoba lagi melalui halaman ini atau jadwal otomatis.
      </p>
      {retryNeeded ? (
        <p
          className="mt-4 rounded-md bg-error-soft p-4 text-sm leading-6 text-error"
          role="alert"
        >
          {error ||
            "Sebagian pembersihan belum berhasil. Data yang sudah dihapus tidak dipulihkan; coba lanjutkan untuk menyelesaikan sisanya."}
        </p>
      ) : null}
      <button
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          setError(null);
          void check("POST");
        }}
        type="button"
      >
        <ArrowClockwise aria-hidden="true" size={18} />
        {busy ? "Memeriksa..." : "Periksa dan lanjutkan"}
      </button>
      {error ? (
        <a
          className="mt-4 flex min-h-12 items-center font-body text-sm font-semibold text-primary underline underline-offset-4"
          href="/login"
        >
          Ke halaman login
        </a>
      ) : null}
    </div>
  );
}
