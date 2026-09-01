# Fintrack AI — LOGO-R0 Typographic Alignment Study

Status: **tested — owner confirmed / direction locked**  
Formal revision tetap `LOGO-R0`; belum masuk `LOGO-R1`.

Studi ini menjawab satu masalah: simbol scan-`F` terlihat seperti huruf, tetapi
proporsinya tidak sepenuhnya selaras dengan `F` pada wordmark Space Grotesk.

## Kandidat yang diuji

1. **Baseline A**  
   Simbol dan wordmark berbeda secara sengaja, tetapi simbol awal terlalu
   dominan terhadap tulisan.

2. **T1 — Integrated F**  
   `F` simbol dan `intrack` memakai Space Grotesk yang sama. Secara teori paling
   selaras, tetapi frame terbaca seperti tanda baca dan mengganggu kata
   `Fintrack`.

3. **T2 — Separate Icon**  
   Simbol Baseline A dipertahankan, ukurannya disetarakan dengan cap-height
   wordmark, dan diberi jarak yang cukup agar dibaca sebagai ikon—bukan glyph
   kedua.

## Hasil

**Pemenang pengujian: simbol Baseline A dengan proporsi lockup T2.**

Hasil ini dikonfirmasi pemilik project pada 2026-07-29 dan menjadi
**Baseline A — Refined Lockup**, basis resmi untuk LOGO-R1.

Ini bukan simbol baru. Perbaikan yang terbukti dibutuhkan adalah hubungan ukuran
dan jarak antara simbol dengan wordmark.

## Artefak utama

- `LOGO_R0_TYPOGRAPHIC_ALIGNMENT_STUDY.svg` dan `.png`
- `TYPOGRAPHIC_ALIGNMENT_OVERLAY.svg` dan `.png`
- `LOCKUP_SIZE_TEST.svg` dan `.png`
- `TYPOGRAPHIC_ALIGNMENT_VERDICT.md`
- `concepts/`
- `tests/`
- `review-notes/SELF_CRITIQUE.md`
- `review-notes/verification-report.json`

## Batas

- Belum menjadi logo produksi final.
- Belum menerapkan warna brand final.
- Belum membuat favicon/PWA assets.
- Belum menetapkan clear space atau minimum size produksi.
- `DESIGN_SYSTEM.md` tidak diubah sebelum owner memilih.
