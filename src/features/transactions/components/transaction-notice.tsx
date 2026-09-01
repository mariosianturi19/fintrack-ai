import { CheckCircle } from "@phosphor-icons/react/dist/ssr/CheckCircle";

const notices = {
  created: "Transaksi manual berhasil disimpan.",
  deleted: "Transaksi berhasil dihapus.",
  "receipt-created": "Hasil struk yang sudah ditinjau berhasil disimpan.",
  updated: "Perubahan transaksi berhasil disimpan.",
} as const;

export type TransactionNoticeStatus = keyof typeof notices;

export function getTransactionNoticeStatus(
  value: string | string[] | undefined,
): TransactionNoticeStatus | null {
  const status = Array.isArray(value) ? value[0] : value;

  return status && status in notices
    ? (status as TransactionNoticeStatus)
    : null;
}

export function TransactionNotice({
  status,
}: {
  status: TransactionNoticeStatus | null;
}) {
  if (!status) {
    return null;
  }

  return (
    <div
      className="mt-5 flex min-w-0 items-start gap-3 rounded-lg border border-signal bg-signal-soft p-4 text-signal-ink"
      role="status"
    >
      <CheckCircle
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        size={20}
        weight="bold"
      />
      <p className="min-w-0 font-body text-sm leading-6 font-medium">
        {notices[status]}
      </p>
    </div>
  );
}
