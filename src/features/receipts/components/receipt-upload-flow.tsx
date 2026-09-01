"use client";

import { ArrowClockwise } from "@phosphor-icons/react/ArrowClockwise";
import { Camera } from "@phosphor-icons/react/Camera";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { Eye } from "@phosphor-icons/react/Eye";
import { ImageSquare } from "@phosphor-icons/react/ImageSquare";
import { SpinnerGap } from "@phosphor-icons/react/SpinnerGap";
import { Trash } from "@phosphor-icons/react/Trash";
import { UploadSimple } from "@phosphor-icons/react/UploadSimple";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { TransactionCategory } from "@/features/transactions/domain";

import {
  compressReceiptImage,
  ReceiptCompressionError,
  type ReceiptCompressionResult,
} from "../compression";
import { RECEIPT_UPLOAD_TYPE } from "../constants";
import type {
  ReceiptAnalysisResult,
  ReceiptUploadConfirmation,
  ReceiptUploadTicket,
} from "../domain";
import { ReceiptReviewForm } from "./receipt-review-form";

type UploadPhase =
  | "idle"
  | "compressing"
  | "ready"
  | "uploading"
  | "verifying"
  | "uploaded"
  | "analyzing"
  | "review";

type ApiError = Readonly<{ message?: string }>;

const acceptedFileTypes = "image/jpeg,image/png,image/webp";

function formatFileSize(bytes: number): string {
  if (bytes < 1_000) {
    return `${bytes} B`;
  }

  return `${(bytes / 1_000).toFixed(bytes >= 100_000 ? 0 : 1)} KB`;
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as ApiError | T | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : undefined;

    throw new Error(
      message ?? "Permintaan belum berhasil. Coba lagi beberapa saat.",
    );
  }

  return data as T;
}

function CropFrame() {
  const cornerClass = "absolute size-8 border-primary";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-3">
      <span className={`${cornerClass} top-0 left-0 border-t-2 border-l-2`} />
      <span className={`${cornerClass} top-0 right-0 border-t-2 border-r-2`} />
      <span
        className={`${cornerClass} bottom-0 left-0 border-b-2 border-l-2`}
      />
      <span
        className={`${cornerClass} right-0 bottom-0 border-r-2 border-b-2`}
      />
    </div>
  );
}

function BusyState({ phase }: Readonly<{ phase: UploadPhase }>) {
  const copy =
    phase === "compressing"
      ? {
          description:
            "Ukuran dan orientasi foto sedang disiapkan di perangkatmu.",
          title: "Menyiapkan foto",
        }
      : phase === "uploading"
        ? {
            description:
              "Foto dikirim langsung ke ruang penyimpanan privat dengan tiket sementara.",
            title: "Mengunggah foto",
          }
        : phase === "analyzing"
          ? {
              description:
                "Foto dibaca secara privat. Hasilnya belum disimpan dan tetap harus kamu koreksi.",
              title: "Membaca struk",
            }
          : {
              description:
                "Server sedang memeriksa ukuran, tipe, dan isi dasar file upload.",
              title: "Memeriksa upload",
            };

  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="relative min-h-[320px] overflow-hidden rounded-xl bg-ink px-6 py-12 text-center text-white shadow-level-1 sm:px-10 sm:py-16"
      role="status"
    >
      <CropFrame />
      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <span className="flex size-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-signal">
          <SpinnerGap
            aria-hidden="true"
            className="animate-spin motion-reduce:animate-none"
            size={28}
          />
        </span>
        <p className="mt-6 font-body text-xs font-semibold tracking-[0.14em] text-signal uppercase">
          Proses nyata
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em]">
          {copy.title}
        </h2>
        <p className="mt-3 font-body text-sm leading-6 text-white/75">
          {copy.description}
        </p>
        <p className="mt-6 font-body text-xs leading-5 text-white/60">
          Tidak ada persentase buatan. Status akan berubah setelah proses
          benar-benar selesai.
        </p>
      </div>
    </section>
  );
}

type ReceiptUploadFlowProps = Readonly<{
  categories: readonly TransactionCategory[];
  maximumDate: string;
}>;

export function ReceiptUploadFlow({
  categories,
  maximumDate,
}: ReceiptUploadFlowProps) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [compressed, setCompressed] = useState<ReceiptCompressionResult | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<ReceiptUploadConfirmation | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReceiptAnalysisResult | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearLocalPhoto() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setCompressed(null);
    setAnalysis(null);
    setConfirmation(null);
    setErrorMessage(null);
    setPhase("idle");
    setPreviewUrl(null);
    setUploadId(null);
  }

  async function cleanupUpload(id: string) {
    const response = await fetch("/api/receipts/uploads", {
      body: JSON.stringify({ uploadId: id }),
      headers: { "Content-Type": "application/json" },
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as ApiError | null;
      throw new Error(
        data?.message ?? "Foto sementara belum dapat dihapus. Coba lagi.",
      );
    }
  }

  async function prepareFile(file: File) {
    setErrorMessage(null);
    setConfirmation(null);
    setPhase("compressing");

    try {
      const result = await compressReceiptImage(file);
      const nextPreviewUrl = URL.createObjectURL(result.blob);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setCompressed(result);
      setPreviewUrl(nextPreviewUrl);
      setUploadId(null);
      setPhase("ready");
    } catch (error) {
      setCompressed(null);
      setPhase("idle");
      setErrorMessage(
        error instanceof ReceiptCompressionError
          ? error.message
          : "Foto belum dapat diproses. Pilih foto lain.",
      );
    }
  }

  async function handleFileSelection(fileList: FileList | null) {
    const file = fileList?.item(0);

    if (file) {
      await prepareFile(file);
    }
  }

  async function handleUpload() {
    if (!compressed) {
      return;
    }

    if (!navigator.onLine) {
      setErrorMessage(
        "Kamu sedang offline. Foto tetap ada di perangkat dan bisa diunggah setelah koneksi kembali.",
      );
      return;
    }

    let currentUploadId: string | null = null;
    setErrorMessage(null);
    setPhase("uploading");

    try {
      const ticketResponse = await fetch("/api/receipts/uploads", {
        body: JSON.stringify({
          contentType: RECEIPT_UPLOAD_TYPE,
          sizeBytes: compressed.blob.size,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const ticket = await readApiResponse<ReceiptUploadTicket>(ticketResponse);
      currentUploadId = ticket.uploadId;
      setUploadId(ticket.uploadId);

      const uploadResponse = await fetch(ticket.uploadUrl, {
        body: compressed.blob,
        headers: { "Content-Type": RECEIPT_UPLOAD_TYPE },
        method: "PUT",
      });

      if (!uploadResponse.ok) {
        throw new Error(
          "Upload ke penyimpanan privat belum berhasil. Foto lokal tetap tersedia.",
        );
      }

      setPhase("verifying");
      const confirmationResponse = await fetch("/api/receipts/uploads", {
        body: JSON.stringify({ uploadId: ticket.uploadId }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const nextConfirmation =
        await readApiResponse<ReceiptUploadConfirmation>(confirmationResponse);

      setConfirmation(nextConfirmation);
      setPhase("uploaded");
    } catch (error) {
      if (currentUploadId) {
        await cleanupUpload(currentUploadId).catch(() => undefined);
      }

      setUploadId(null);
      setPhase("ready");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Upload belum berhasil. Foto lokal tetap tersedia.",
      );
    }
  }

  async function handleRemove() {
    setErrorMessage(null);

    if (uploadId) {
      try {
        await cleanupUpload(uploadId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Foto sementara belum dapat dihapus.",
        );
        return;
      }
    }

    clearLocalPhoto();
  }

  async function handleAnalyze() {
    if (!uploadId) {
      return;
    }

    if (!navigator.onLine) {
      setErrorMessage(
        "Kamu sedang offline. Foto tetap aman dan dapat diperiksa setelah koneksi kembali.",
      );
      return;
    }

    setErrorMessage(null);
    setPhase("analyzing");

    try {
      const response = await fetch("/api/receipts/analyze", {
        body: JSON.stringify({
          requestId: crypto.randomUUID(),
          uploadId,
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = await readApiResponse<ReceiptAnalysisResult>(response);

      setAnalysis(result);
      setPhase("review");
    } catch (error) {
      setPhase("uploaded");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Pemeriksaan AI belum berhasil. Kamu tetap dapat input manual.",
      );
    }
  }

  async function handleManualEntry() {
    setErrorMessage(null);

    if (uploadId) {
      try {
        await cleanupUpload(uploadId);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Foto sementara belum dapat dihapus.",
        );
        return;
      }
    }

    window.location.assign("/transactions/new");
  }

  if (
    phase === "compressing" ||
    phase === "uploading" ||
    phase === "verifying" ||
    phase === "analyzing"
  ) {
    return <BusyState phase={phase} />;
  }

  if (phase === "review" && analysis && previewUrl) {
    return (
      <ReceiptReviewForm
        analysis={analysis}
        categories={categories}
        maximumDate={maximumDate}
        onManualFallback={() => void handleManualEntry()}
        previewUrl={previewUrl}
      />
    );
  }

  return (
    <div className="min-w-0">
      {errorMessage ? (
        <div
          aria-live="assertive"
          className="mb-5 rounded-lg border border-error bg-error-soft px-4 py-3 font-body text-sm leading-6 text-error"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {phase === "idle" ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:gap-8">
          <div className="min-w-0">
            <span className="flex size-12 items-center justify-center rounded-md bg-primary-soft text-primary">
              <Camera aria-hidden="true" size={25} />
            </span>
            <p className="mt-6 font-body text-xs font-semibold tracking-[0.14em] text-primary uppercase">
              Langkah 1 dari 2
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
              Ambil foto struk yang jelas.
            </h2>
            <p className="mt-3 max-w-xl font-body text-sm leading-6 text-ink-secondary">
              Letakkan seluruh struk di dalam frame, hindari bayangan, dan
              pastikan nominal tetap terbaca. Foto akan dikompresi di perangkat
              sebelum dikirim.
            </p>
          </div>

          <div className="mt-7 flex min-w-0 flex-col justify-center gap-3 border-t border-divider pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <label
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-transparent bg-primary px-5 font-body text-[15px] font-semibold text-white transition-colors hover:bg-primary-hover focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-primary"
              htmlFor="receipt-camera-input"
            >
              <Camera aria-hidden="true" size={20} weight="bold" />
              Ambil foto
            </label>
            <input
              accept={acceptedFileTypes}
              capture="environment"
              className="sr-only"
              id="receipt-camera-input"
              onChange={(event) => {
                void handleFileSelection(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />

            <label
              className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-surface px-5 font-body text-[15px] font-semibold text-primary transition-colors hover:bg-primary-soft focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-primary"
              htmlFor="receipt-gallery-input"
            >
              <ImageSquare aria-hidden="true" size={20} />
              Pilih dari galeri
            </label>
            <input
              accept={acceptedFileTypes}
              className="sr-only"
              id="receipt-gallery-input"
              onChange={(event) => {
                void handleFileSelection(event.currentTarget.files);
                event.currentTarget.value = "";
              }}
              type="file"
            />
            <p className="font-body text-xs leading-5 text-ink-warm-muted">
              JPG, PNG, atau WebP · maksimal 15 MB sebelum kompresi
            </p>
          </div>
        </section>
      ) : null}

      {(phase === "ready" || phase === "uploaded") &&
      compressed &&
      previewUrl ? (
        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-level-1 lg:grid lg:grid-cols-[minmax(300px,0.86fr)_minmax(0,1fr)]">
          <div className="relative min-h-[310px] overflow-hidden bg-canvas-subtle sm:min-h-[420px] lg:min-h-[480px]">
            <Image
              alt="Preview foto struk yang akan diunggah"
              className="object-contain p-5"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              src={previewUrl}
              unoptimized
            />
            <CropFrame />
          </div>

          <div className="min-w-0 border-t border-divider p-5 sm:p-7 lg:border-t-0 lg:border-l">
            {phase === "uploaded" && confirmation ? (
              <>
                <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-signal-soft px-3 font-body text-xs font-semibold text-signal-ink">
                  <CheckCircle aria-hidden="true" size={17} weight="bold" />
                  Upload privat terverifikasi
                </span>
                <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                  Foto aman untuk tahap pemeriksaan.
                </h2>
                <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
                  File tersimpan sementara dan hanya dapat diakses melalui
                  tautan privat yang cepat kedaluwarsa. Mulai pemeriksaan jika
                  foto sudah benar.
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-divider py-5 font-body text-sm">
                  <div>
                    <dt className="text-ink-secondary">Ukuran upload</dt>
                    <dd className="numeric mt-1 font-semibold text-ink">
                      {formatFileSize(confirmation.sizeBytes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary">Akses preview</dt>
                    <dd className="mt-1 font-semibold text-ink">5 menit</dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    onClick={() => void handleAnalyze()}
                    type="button"
                  >
                    <CheckCircle aria-hidden="true" size={19} weight="bold" />
                    Periksa dengan AI
                  </button>
                  <a
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    href={confirmation.previewUrl}
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Eye aria-hidden="true" size={19} />
                    Periksa preview privat
                  </a>
                  <button
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    onClick={() => void handleManualEntry()}
                    type="button"
                  >
                    Input manual
                  </button>
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-error bg-surface px-5 font-body text-sm font-semibold text-error transition-colors hover:bg-error-soft"
                    onClick={() => void handleRemove()}
                    type="button"
                  >
                    <Trash aria-hidden="true" size={19} />
                    Hapus foto
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-body text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                  Langkah 2 dari 2
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.02em] text-ink">
                  Periksa foto sebelum upload.
                </h2>
                <p className="mt-3 font-body text-sm leading-6 text-ink-secondary">
                  Pastikan merchant, tanggal, dan total masih terbaca. Kamu
                  selalu dapat mengganti foto sebelum mengirimkannya.
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-divider py-5 font-body text-sm">
                  <div>
                    <dt className="text-ink-secondary">Sebelum</dt>
                    <dd className="numeric mt-1 font-semibold text-ink">
                      {formatFileSize(compressed.originalBytes)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-secondary">Siap upload</dt>
                    <dd className="numeric mt-1 font-semibold text-ink">
                      {formatFileSize(compressed.blob.size)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-5 font-body text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    onClick={() => void handleUpload()}
                    type="button"
                  >
                    <UploadSimple aria-hidden="true" size={19} weight="bold" />
                    Upload privat
                  </button>
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-primary bg-surface px-5 font-body text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
                    onClick={clearLocalPhoto}
                    type="button"
                  >
                    <ArrowClockwise aria-hidden="true" size={19} />
                    Ganti foto
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
