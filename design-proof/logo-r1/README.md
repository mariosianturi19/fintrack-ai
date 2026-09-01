# Fintrack AI — LOGO-R1

Status: **FINAL / LOCKED FOR DESIGN PROOF**  
Direction: **Baseline A — Refined Lockup**  
Confirmed by: Mario Sianturi on 2026-07-29  
Production status: approved for provisional use in CP2–CP4; final production
lock remains at CP5.

LOGO-R1 menerjemahkan arah yang dikunci pada LOGO-R0 menjadi sistem logo yang
akan diuji di dalam high-fidelity interface. Konsep tidak berubah: simbol tetap
memakai `Signal Frame F`, dipasangkan sebagai ikon terpisah dengan wordmark
`Fintrack AI`.

## Review boards

- `LOGO_R1_MASTER_SHEET.png` — master mark, lockup, dan tiga optical variants.
- `LOGO_R1_USAGE_RULES.png` — colorways, clear space, serta minimum size.
- `LOGO_R1_SMALL_SIZE_TEST.png` — perbandingan master/micro dan lockup aktual.
- `LOGO_R1_CONTEXT_TESTS.png` — mobile app bar, desktop sidebar, dan PWA.
- `LOGO_R1_PWA_SAFE_ZONE.png` — standard dan maskable icon.

## Production assets

### Standalone mark

- `assets/marks/fintrack-ai-mark-*` — master mark untuk ukuran 24 px ke atas.
- `assets/marks/fintrack-ai-mark-micro-*` — micro mark untuk 16–23 px.

### Horizontal lockup

- `assets/lockups/fintrack-ai-lockup-*` — master lockup mulai 28 px high.
- `assets/lockups/fintrack-ai-lockup-compact-*` — compact lockup 24–27 px high.

Semua production SVG lockup menggunakan outlined wordmark. File tidak
bergantung pada font yang terpasang di perangkat pengguna.

### App icons

- Standard PWA: 192 dan 512 px.
- Maskable PWA: 192 dan 512 px.
- Favicon: 16 dan 32 px.

## Core usage

- Primary: Mineral Blue mark + Midnight wordmark pada Rice Paper atau surface
  terang yang bersih.
- Reverse: Rice Paper pada Midnight.
- Monochrome: Midnight atau white sesuai background.
- Minimum clear space: `1x` pada seluruh sisi; `x` adalah ketebalan vertical
  stem master mark pada skala pemakaian.
- Jangan memberi gradient, glow, shadow, rotasi, atau Signal Leaf pada logo.
- Jangan memisahkan crop corners dari posisi master atau mengganti wordmark
  dengan font lain.

## Verification

Jalankan `tooling/verify-logo-r1.mjs` setelah regenerasi aset. Laporan terakhir
tersedia di `review-notes/verification-report.json`.

Automated verification tidak menggantikan review manusia. Distinctiveness,
optical balance, dan kecocokan di dalam interface tetap harus dinilai pada CP2,
CP3, dan CP5.
