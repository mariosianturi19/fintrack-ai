# CP5-R0 Visual QA Report

Status: **FINAL / LOCKED**

## Ringkasan awal

Audit tidak menemukan alasan untuk mengubah arah **Quiet Signal — Refined**,
hierarchy CP1, mobile structure CP2, desktop composition CP3, atau interaction
architecture CP4.

Klasifikasi awal:

- P0: `0`
- P1: `0`
- P2: `2`
- P3: `5`
- Pending external validation: `2`

## Temuan P2

### FT-PREC-001 — Weekly summary subcolumn tidak mempunyai safe text width

- Evidence:
  - `local-cp3/desktop/desktop-dashboard-default-cp3-r0.png`
  - `local-cp3/tests/dashboard-1280-px-cp3-r0.png`
- Gejala:
  - label uppercase `PENGELUARAN MINGGU INI` menyentuh atau melewati safe
    padding kanan;
  - button `Tambah manual` terlihat terlalu ketat pada subcolumn tetap.
- Penyebab:
  - subcolumn memakai lebar tetap, sementara label memakai uppercase +
    letter-spacing dan tidak mempunyai responsive copy/layout rule.
- Correction contract:
  - visual label compact menjadi `Minggu ini`;
  - accessible context tetap “Pengeluaran minggu ini”;
  - right subcolumn menggunakan `minmax(176px, 0.36fr)`;
  - inner right padding minimum `28px` pada wide dan `24px` pada compact;
  - button `inline-size: 100%`, `max-inline-size: 168px`, tanpa clipping;
  - pada ruang yang lebih sempit dari minimum, subcolumn pindah ke baris baru.
- Status: **Specified in CP5; implementation pending**.

### FT-PREC-002 — Badge `OFFLINE / CACHED` overflow

- Evidence:
  - `local-cp4/states/mobile/mobile-scan-offline-cp4-r0.png`
- Gejala:
  - text melampaui badge fixed-width `96px` dan terlalu dekat dengan tepi layar.
- Penyebab:
  - badge memakai width statis yang sama untuk semua status.
- Correction contract:
  - width intrinsic;
  - horizontal padding `10px`;
  - minimum width `128px` untuk label tersebut;
  - `white-space: nowrap`;
  - right inset minimum `16px`;
  - pada localization yang lebih panjang, badge boleh wrap menjadi dua baris
    dengan tinggi otomatis dan tidak boleh keluar container.
- Status: **Specified in CP5; implementation pending**.

## Temuan P3

### FT-PREC-003 — Logo context board lama menyebut sidebar `280px`

Authority final adalah CP3: sidebar desktop `240px` dengan rentang design
system `232–248px`. Angka `280px` pada `LOGO_R1_CONTEXT_TESTS` adalah test
canvas lama, bukan implementation token.

### FT-PREC-004 — Small text pada proof tidak boleh menjadi runtime default

Label `10–11px` pada board, status bar, dan beberapa metadata proof tidak
otomatis menjadi ukuran produksi. Critical runtime text minimum `12px`;
body/form minimum `14–16px`; navigation label minimum `11px` dengan target
sentuh terpisah `44px`.

### FT-PREC-005 — CP3 upload + processing adalah comparison artifact

Runtime authority adalah dua state terpisah pada CP4:

- `desktop-scan-upload-ready-cp4-r0`
- `desktop-scan-processing-cp4-r0`

Programmer tidak boleh menjadikan comparison board CP3 sebagai satu halaman
dengan dua state aktif bersamaan.

### FT-PREC-006 — Transition `1024px` belum mempunyai frame runtime penuh

CP5 menambahkan `compact-dashboard-1024-cp5-r0` sebagai proof:

- compact rail `72px`;
- content padding `24px`;
- tidak ada bottom navigation;
- typography tidak dikecilkan;
- weekly summary memakai correction contract FT-PREC-001.

### FT-PREC-007 — Editable-source statement tidak sesuai kondisi aktual

Figma working file tidak menjadi source yang dapat diverifikasi melalui
workflow saat ini. Authority yang tersedia adalah final locks, SVG, PNG,
token, generator lokal, dan CP5 handoff package.

## Pending external validation

### FT-VAL-001 — Installed PWA physical-device test

Favicon dan PWA exports dapat diverifikasi secara struktural, tetapi hasil
masking launcher, installed app presence, dan splash behavior perlu perangkat
nyata atau build PWA.

### FT-VAL-002 — 1–2 beta-user test

`DESIGN_SYSTEM.md` memasukkan beta-user test ke Definition of Done. Tidak ada
bukti bahwa test tersebut sudah dilakukan. Script tersedia di
`CP5_R0_BETA_TEST_SCRIPT.md`.

## Final verdict

Tidak diperlukan direction change atau checkpoint revision untuk hierarchy.
Board, token, inventory, browser QA, dan verifier CP5 selesai; owner
mengonfirmasi CP5-R0 final pada 2026-07-29. Dua pending external validation dan
runtime accessibility tetap dicatat sebagai implementation gates, bukan hasil
lulus yang difabrikasi.
