import { Plus } from "@phosphor-icons/react/dist/ssr/Plus";
import { Wallet } from "@phosphor-icons/react/dist/ssr/Wallet";

import { createWalletAction, updateWalletAction } from "../actions";
import {
  getWalletTypeLabel,
  WALLET_TYPES,
  type WalletManagementRecord,
} from "../domain";
import { RemoveWalletDialog } from "./remove-wallet-dialog";

export function WalletManager({
  wallets,
}: Readonly<{ wallets: readonly WalletManagementRecord[] }>) {
  return (
    <section
      aria-labelledby="wallets-title"
      className="mt-8 min-w-0 rounded-xl border border-border bg-surface p-5 shadow-level-1 sm:p-7"
      id="wallets"
    >
      <div className="flex min-w-0 flex-col gap-5 border-b border-divider pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Sumber pembayaran
          </p>
          <h2
            className="mt-1 font-display text-[22px] leading-7 font-semibold text-ink"
            id="wallets-title"
          >
            Kelola dompet
          </h2>
          <p className="mt-2 max-w-[680px] font-body text-sm leading-6 text-ink-secondary">
            Buat sendiri dompet yang kamu gunakan dan tentukan jenisnya, seperti
            BCA sebagai Bank atau GoPay sebagai E-wallet. Fintrack AI belum
            menarik saldo dari penyedia tersebut.
          </p>
        </div>
        <form
          action={createWalletAction}
          className="grid w-full min-w-0 gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[240px_170px_auto] lg:items-end"
        >
          <label className="min-w-0">
            <span className="mb-1.5 block font-body text-xs font-semibold text-ink-secondary">
              Nama dompet
            </span>
            <input
              className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-4 font-body text-sm text-ink outline-none focus:border-primary sm:w-[240px]"
              maxLength={48}
              name="name"
              placeholder="Contoh: BCA atau GoPay"
              required
            />
          </label>
          <label className="min-w-0">
            <span className="mb-1.5 block font-body text-xs font-semibold text-ink-secondary">
              Jenis dompet
            </span>
            <select
              className="min-h-12 w-full min-w-0 rounded-md border border-border bg-surface px-3 font-body text-sm text-ink outline-none focus:border-primary"
              defaultValue=""
              name="walletType"
              required
            >
              <option disabled value="">
                Pilih jenis
              </option>
              {WALLET_TYPES.map((walletType) => (
                <option key={walletType} value={walletType}>
                  {getWalletTypeLabel(walletType)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 font-body text-sm font-semibold text-white hover:bg-primary-hover"
            type="submit"
          >
            <Plus aria-hidden="true" size={18} weight="bold" />
            Tambah dompet
          </button>
        </form>
      </div>

      {wallets.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-border bg-canvas-subtle p-6 text-center sm:p-8">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Wallet aria-hidden="true" size={24} />
          </span>
          <h3 className="mt-4 font-display text-lg font-semibold text-ink">
            Belum ada dompet
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-6 text-ink-secondary">
            Tambahkan sumber pembayaran pertama beserta jenisnya. Setelah itu,
            setiap transaksi akan meminta kamu memilih dompet secara eksplisit.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
          {wallets.map((wallet) => (
            <article
              className="min-w-0 rounded-lg border border-border bg-canvas-subtle p-4 sm:p-5"
              key={wallet.id}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="min-w-0 font-display text-lg font-semibold text-ink">
                  {wallet.name}
                </p>
                <span className="inline-flex min-h-7 items-center rounded-sm bg-primary-soft px-2.5 font-body text-xs font-semibold text-primary">
                  {getWalletTypeLabel(wallet.walletType)}
                </span>
              </div>
              <p className="mt-1 font-body text-xs leading-5 text-ink-secondary">
                Dibuat oleh kamu · tersedia saat mencatat transaksi
              </p>
              <form
                action={updateWalletAction}
                className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end"
              >
                <input name="walletId" type="hidden" value={wallet.id} />
                <label className="min-w-0 flex-1">
                  <span className="mb-1.5 block font-body text-xs font-semibold text-ink-secondary">
                    Nama
                  </span>
                  <input
                    className="min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 font-body text-sm text-ink outline-none focus:border-primary"
                    defaultValue={wallet.name}
                    maxLength={48}
                    name="name"
                    required
                  />
                </label>
                <label className="min-w-0">
                  <span className="mb-1.5 block font-body text-xs font-semibold text-ink-secondary">
                    Jenis
                  </span>
                  <select
                    className="min-h-11 w-full min-w-0 rounded-md border border-border bg-surface px-3 font-body text-sm text-ink outline-none focus:border-primary"
                    defaultValue={wallet.walletType}
                    name="walletType"
                    required
                  >
                    {WALLET_TYPES.map((walletType) => (
                      <option key={walletType} value={walletType}>
                        {getWalletTypeLabel(walletType)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-surface px-4 font-body text-sm font-semibold text-primary hover:bg-primary-soft"
                  type="submit"
                >
                  Simpan
                </button>
              </form>
              <div className="mt-2 flex justify-end">
                <RemoveWalletDialog
                  name={wallet.name}
                  receiptCount={wallet.receiptCount}
                  transactionCount={wallet.transactionCount}
                  walletId={wallet.id}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
